const http2 = require('http2');
const { Error: MongooseError } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { BadRequestError } = require('../errors/BadRequestError');
const { ConflictError } = require('../errors/ConflictError');
const { NotFoundError } = require('../errors/NotFoundError');
const { UnauthorizedError } = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;
const MONGO_ERROR_CODE_DUPLICATE = 11000;
const HTTP2_STATUS = http2.constants;

const createUser = async (req, res, next) => {
  try {
    // Хеширование пароля перед созданием пользователя
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Создание пользователя с хешированным паролем
    const user = await User.create({
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
    });
    return res.status(HTTP2_STATUS.HTTP_STATUS_CREATED).send(
      {
        _id: user._id,
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
      },
    );
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
    }
    if (error.code === MONGO_ERROR_CODE_DUPLICATE) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userUpdate = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      { new: true, runValidators: true },
    ).orFail(() => new Error('NotFoundError'));

    return res.status(HTTP2_STATUS.HTTP_STATUS_OK).send({
      name: userUpdate.name,
      email: userUpdate.email,
    });
  } catch (error) {
    if (error.message === 'NotFoundError') {
      return next(new NotFoundError('Пользователь по указанному ID не найден.'));
    }
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError('Переданы некорректные данные при обновлении профиля.'));
    }
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new UnauthorizedError('Неправильные почта или пароль'));
    }

    const matched = await bcrypt.compare(password, user.password);

    if (!matched) {
      return next(new UnauthorizedError('Неправильные почта или пароль'));
    }

    const token = jwt.sign({ _id: user._id }, NODE_ENV !== 'production' ? 'dev-secret' : JWT_SECRET, { expiresIn: '7d' });
    res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 * 24 * 7, sameSite: true });

    return res.status(HTTP2_STATUS.HTTP_STATUS_OK).send({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};

const logout = (req, res, next) => {
  try {
    // Очистка куки
    res.clearCookie('jwt', { httpOnly: true, sameSite: true });

    return res.status(HTTP2_STATUS.HTTP_STATUS_OK).json({ message: 'Вы успешно вышли из учетной записи!' });
  } catch (error) {
    return next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new NotFoundError('Текущий пользователь не найден.'));
    }
    return res.status(HTTP2_STATUS.HTTP_STATUS_OK).send({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createUser,
  updateUser,
  login,
  getMyProfile,
  logout,
};
