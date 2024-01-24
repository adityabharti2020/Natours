const express = require('express');
const userController = require('../Controller/userController');
const authController = require('../Controller/authController');
const router = express.Router(); //it will work like middleWare

router.post('/signUp', authController.signUp);
router.post('/logIn', authController.login);
router.post('/forgotPassword', authController.forgotPassword); //only recives email address
router.patch('/resetPassword', authController.resetPassword); //recives token as well as password

// middleware runs in sequence
// protects all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
// router 
//   .route('/signUp')
//   .post(authController.signUp);

router.use(authController.restrictTo('admin'));

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
