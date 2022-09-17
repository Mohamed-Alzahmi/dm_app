//use express
const express = require('express');
const authToken = require("../util/authenticateToken"); //used for login token
const router = express.Router();


//controller
const shopController = require('../controllers/shop');
const shop = require('../models/shop');

//get request
router.get('/',authToken, shopController.getAllShops)

//post shop
router.post('/', authToken, shopController.postShop);

//put request
router.put('/', authToken, shopController.putShop);

//shop get search
router.get('/search', authToken, shopController.searchShops);

//export router
module.exports = router;