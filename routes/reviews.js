require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const router = express.Router();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

(async () => {
    try {
        await client.connect();
        db = client.db('tours');
        console.log('Connected to database');
    } catch (error) {
        console.error('Failed to connect to database:', error);
    }
})();

const reviewsCollection = () => db.collection('reviews');

// Добавить отзыв
router.post('/', async (req, res) => {
    try {
        const { name, email, text, phone, date, language } = req.body;

        if (!name || !email || !text || !date || !language) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const review = {
            name,
            email,
            phone: phone || null,
            text,
            date,
            language,
            published: false,
            createdAt: new Date().toISOString(),
            userAgent: req.headers['user-agent'] || 'unknown',
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        };

        const result = await reviewsCollection().insertOne(review);
        res.status(201).json({ message: 'Review added successfully', id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Error adding review', error });
    }
});

// Получить отзывы
router.get('/', async (req, res) => {
    try {
        const { language } = req.query;

        const query = language ? { language } : {};
        const reviews = await reviewsCollection().find(query).toArray();

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
});

// Редактировать отзыв
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Review text is required' });
        }

        const result = await reviewsCollection().updateOne(
            { _id: new ObjectId(id) },
            { $set: { text, updatedAt: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Review updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error });
    }
});

// Изменить язык отзыва
router.put('/:id/language', async (req, res) => {
    try {
        const { id } = req.params;
        const { newLanguage } = req.body;

        if (!newLanguage) {
            return res.status(400).json({ message: 'New language is required' });
        }

        const result = await reviewsCollection().updateOne(
            { _id: new ObjectId(id) },
            { $set: { language: newLanguage } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Language updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating language', error });
    }
});

// Опубликовать отзыв
router.put('/:id/publish', async (req, res) => {
    try {
        const { id } = req.params;

        // Найдем отзыв по ID
        const review = await reviewsCollection().findOne({ _id: new ObjectId(id) });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Инвертируем статус (если было true → станет false, и наоборот)
        const newStatus = !review.published;

        const result = await reviewsCollection().updateOne(
            { _id: new ObjectId(id) },
            { $set: { published: newStatus, publishedAt: newStatus ? new Date().toISOString() : null } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ success: true, published: newStatus });
    } catch (error) {
        res.status(500).json({ message: 'Error updating publish status', error });
    }
});


// Удалить отзыв
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await reviewsCollection().deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
});

module.exports = router;
