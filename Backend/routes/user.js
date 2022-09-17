//use express
const express = require('express');
const authToken = require("../util/authenticateToken"); //used for login token
const router = express.Router();

//controller
const userController = require('../controllers/user');

//create user
router.post('/create', userController.createUser); 

//login
router.post('/login', userController.Login);

//reset password
router.put('/reset', authToken, userController.ResetPassword);

//update user
router.put('/update', authToken, userController.UpdateUserInfo);

//export router
module.exports = router;