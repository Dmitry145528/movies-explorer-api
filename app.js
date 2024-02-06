const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
// const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
// const router = require('./routes/routes');
// const { login, createUser } = require('./controllers/users');
// const auth = require('./middlewares/auth');
const { errorHandler } = require('./errors/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT, MONGO_URL } = process.env;

const app = express();
mongoose.connect(MONGO_URL || 'mongodb://127.0.0.1:27017/mestodb');

app.use(express.json());
app.use(cookieParser());

app.use(requestLogger); // подключаем логгер запросов

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());
app.use(errorHandler);

app.listen(PORT || 3000);
