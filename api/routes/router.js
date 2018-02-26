var express = require('express');
var router = express.Router();
var user = require('../controllers/users');

router.post('/user/signup', user.signup);
router.post('/user/login', user.login);
router.post('/user/mobile', user.setMobile);
router.post('/user/verify/mobile', user.verifyMobile);
router.get('/user/verify/email/:id', user.verifyEmail);
router.post('/user/verify/email', user.sendVerMail);

module.exports = router;
