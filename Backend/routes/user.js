//use express
const express = require('express');
const router = express.Router();

//controller
const userController = require('../controllers/user');

//create user
router.post('/create', userController.createUser);

//update user
router.post('/update', userController.UpdateUserInfo);

//login
router.post('/login', userController.Login);

//reset password
router.put('/reset', userController.ResetPassword);

//export router
module.exports = router;