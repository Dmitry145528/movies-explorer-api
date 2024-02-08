const http2 = require('http2');
const { Error: MongooseError } = require('mongoose');
const Movie = require('../models/movie');
const { NotFoundError } = require('../errors/NotFoundError');
const { BadRequestError } = require('../errors/BadRequestError');
const { ForbiddenError } = require('../errors/ForbiddenError');

const HTTP2_STATUS = http2.constants;

let movies = [];

const getMovies = async (req, res, next) => {
  try {
    movies = await Movie.find({ owner: req.user._id });

    return res.status(HTTP2_STATUS.HTTP_STATUS_OK).send(movies);
  } catch (error) {
    return next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ movieId: req.params.movieId });

    if (!movie) {
      return next(new NotFoundError('Фильм с указанным _id не найден.'));
    }

    if (movie.owner.toString() !== req.user._id) {
      return next(new ForbiddenError('У вас нет прав на удаление этого фильма.'));
    }

    await Movie.findOneAndDelete({ movieId: req.params.movieId }).orFail(
      () => new Error('NotFoundError'),
    );

    return res.status(HTTP2_STATUS.HTTP_STATUS_OK).send({ message: 'Фильм успешно удален.' });
  } catch (error) {
    if (error.message === 'NotFoundError') {
      return next(new NotFoundError('Фильм с указанным _id не найден'));
    }
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError('Передан не валидный ID.'));
    }
    return next(error);
  }
};

const createMovie = async (req, res, next) => {
  try {
    const newMovie = await Movie.create({ ...req.body, owner: req.user._id });
    return res.status(HTTP2_STATUS.HTTP_STATUS_CREATED).send(newMovie);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError('Переданы некорректные данные при создании фильма.'));
    }
    return next(error);
  }
};

module.exports = {
  getMovies,
  deleteMovie,
  createMovie,
};
