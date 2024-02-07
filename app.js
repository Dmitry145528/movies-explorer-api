const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const { errors } = require('celebrate');
const rateLimiter = require('./middlewares/rateLimiter');
const router = require('./routes/index');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { errorHandler } = require('./errors/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { signInValidation, signUpValidation } = require('./utils/validation');

const { PORT, MONGO_URL, NODE_ENV } = process.env;

const app = express();
app.use(cors({ origin: [''], credentials: true, maxAge: 120 }));
app.use(helmet());
mongoose.connect(NODE_ENV !== 'production' ? 'mongodb://127.0.0.1:27017/bitfilmsdb' : MONGO_URL);

app.use(rateLimiter); // Ограниченное число запросов с одного IP

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger); // подключаем логгер запросов

app.post('/signin', signInValidation, login);
app.post('/signup', signUpValidation, createUser);

app.use(auth);
app.use('/', router);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());
app.use(errorHandler);

app.listen(NODE_ENV !== 'production' ? 3000 : PORT);
