var express = require('express');
var router = express.Router();
var user = require('../controllers/userController');
var plan = require('../controllers/planController');
var firm = require('../controllers/firmController');
var coUser = require('../controllers/coUserController');

router.post('/user/signup', user.signup);
router.post('/user/login', user.login);
router.post('/user/mobile', user.setMobile);
router.post('/user/verify/mobile', user.verifyMobile);
router.get('/plans', plan.getPlans);
router.post('/user/plan', firm.setPlan);
router.post('/user/co_user', coUser.createCoUser);
router.get('/user/co_user', coUser.getCoUsers);
router.post('/user/admins', coUser.createAdmins);
router.get('/user/admins', coUser.getAdmins);

router.post('/user/role' , coUser.setRole);
router.get('/user/role/:id', coUser.getRoles);

router.post('/user/image', user.profileImage);

router.post('/user/sign', user.signature);
router.get('/user/profile', user.getUserProfile);
router.post('/user/profile', user.setUserProfile);
router.get('/firm/profile', firm.getFirmProfile);
router.post('/firm/profile', firm.setFirmProfile);
router.post('/firm/logo', firm.logoImage);
router.get('/user', user.getCurrentUser);
router.get('/firm', firm.getCurrentFirm);
router.get('/plan', plan.getCurrentPlan);
router.post('/user/changePassword', user.changePassword);
router.post('/user/setNewPassword', user.setNewPassword);
router.get('user/resetPassword/:id',user.resetPassword);
router.delete('/user/co_user/:id', user.deleteUser);

module.exports = router;
