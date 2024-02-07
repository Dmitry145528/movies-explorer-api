const movieRouter = require('express').Router();
const { movieCreateValidation, movieDeleteValidation } = require('../utils/validation');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

movieRouter.get('/', getMovies);
movieRouter.post('/', movieCreateValidation, createMovie);
movieRouter.delete('/:movieId', movieDeleteValidation, deleteMovie);

module.exports = movieRouter;
