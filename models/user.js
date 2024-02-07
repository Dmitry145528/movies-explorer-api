const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [2, 'Минимальная длина 2 символа'],
      maxlength: [30, 'Максимальная длина 30 символов'],
      required: {
        value: true,
        message: 'Поле name является обязательным',
      },
    },
    email: {
      type: String,
      required: {
        value: true,
        message: 'Поле email является обязательным',
      },
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: 'Некорректный формат email',
      },
    },
    password: {
      type: String,
      minlength: [8, 'Минимальная длина 8 символа'],
      required: {
        value: true,
        message: 'Поле password является обязательным',
      },
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

module.exports = mongoose.model('user', userSchema);
