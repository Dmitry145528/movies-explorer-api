const express = require('express');
const mongoose = require('mongoose');

const { PORT, MONGO_URL } = process.env;

const app = express();
mongoose.connect(MONGO_URL || 'mongodb://127.0.0.1:27017/mestodb');

app.use(express.json());

app.listen(PORT || 3000);
