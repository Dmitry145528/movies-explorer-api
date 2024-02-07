const userRouter = require('express').Router();
const { userUpdateValidation } = require('../utils/validation');
const {
  updateUser,
  getMyProfile,
} = require('../controllers/users');

userRouter.get('/me', getMyProfile);
userRouter.patch('/me', userUpdateValidation, updateUser);

module.exports = userRouter;
