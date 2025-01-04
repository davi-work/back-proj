require('dotenv').config(); // Для работы с переменными окружения
const express = require('express');
const cors = require('cors');
const toursRouter = require('./routes/tours'); // Подключаем маршруты
const reviewsRouter = require('./routes/reviews'); // Новый маршрут для отзывов

const app = express();
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(express.json()); // Для обработки JSON-тела запросов

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use('/api/tours', toursRouter);
app.use('/api/reviews', reviewsRouter);
