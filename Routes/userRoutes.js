const express = require('express');
const userController = require('../Controller/userController');
const authController = require('../Controller/authController');

const router = express.Router(); //it will work like middleWare

router.post('/signUp',authController.signUp);
router.post('/logIn',authController.login);
router.post('/forgotPassword',authController.login); //only recives email address
router.post('/resetPassword',authController.login);  //recives token as well as password
// router
//   .route('/signUp')
//   .post(authController.signUp);
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
