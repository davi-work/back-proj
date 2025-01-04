require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); 

const router = express.Router();

const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri);

let toursCollection;

(async () => {
    try {
        await client.connect();
        const database = client.db('tours');
        console.log('Connected to database');
    } catch (error) {
        console.error('Failed to connect to database:', error);
    }
})();

router.get('/:lang', async (req, res) => {
    try {
        const { lang } = req.params;

        if (lang !== 'ru' && lang !== 'en') {
            return res.status(400).json({ message: 'Invalid language parameter' });
        }

        toursCollection = client.db('tours').collection(`tours_${lang}`);
        
        const tours = await toursCollection.find().toArray();
        res.status(200).json(tours);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tours', error });
    }
});

router.get('/:lang/:id', async (req, res) => {
    try {
        const { lang, id } = req.params;

        if (lang !== 'ru' && lang !== 'en') {
            return res.status(400).json({ message: 'Invalid language parameter' });
        }

        toursCollection = client.db('tours').collection(`tours_${lang}`);
        
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const tour = await toursCollection.findOne({ _id: numericId });
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.status(200).json(tour);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tour', error });
    }
});


module.exports = router;
