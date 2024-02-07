const http2 = require('http2');
const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const { logout } = require('../controllers/users');

const HTTP2_STATUS = http2.constants;

router.use('/users', userRouter);
router.use('/movies', movieRouter);
router.post('/signout', logout);
router.use((req, res) => {
  res.status(HTTP2_STATUS.HTTP_STATUS_NOT_FOUND).send({ message: 'Страница не найдена' });
});

module.exports = router;
