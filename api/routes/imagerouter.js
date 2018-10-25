var express = require('express');
var router = express.Router();
var user = require('../controllers/userController');
var firm = require('../controllers/firmController');
var client = require('../controllers/clientController');


router.post('/user/sign', user.signature);
router.post('/user/image', user.profileImage);
router.post('/firm/logo', firm.logoImage);
router.post('/user/client/picture/:id', client.profileImage);

module.exports = router;