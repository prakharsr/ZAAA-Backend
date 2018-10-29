var express = require('express');
var router = express.Router();
var user = require('../controllers/userController');
var firm = require('../controllers/firmController');
var client = require('../controllers/clientController');


router.post('/user/sign', user.signature2);
router.post('/user/image', user.profileImage2);
router.post('/firm/logo', firm.logoImage2);
router.post('/user/client/picture/:id', client.profileImage2);

module.exports = router;