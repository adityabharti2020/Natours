const express = require('express');
const userController = require('../Controller/userController');

const router = express.Router(); //it will work like middleWare

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
