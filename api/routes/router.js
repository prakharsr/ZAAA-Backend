var express = require('express');
var router = express.Router();
var user = require('../controllers/users');
var plan = require('../controllers/plan');

router.post('/user/signup', user.signup);
router.post('/user/login', user.login);
router.post('/user/mobile', user.setMobile);
router.post('/user/verify/mobile', user.verifyMobile);
router.get('/user/verify/email/:id', user.verifyEmail);
router.post('/user/verify/email', user.sendVerMail);
router.get('/get/plans', plan.getPlans);
router.post('/user/set/plan', user.setPlan);

module.exports = router;
