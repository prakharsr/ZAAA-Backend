var express = require('express');
var router = express.Router();
var user = require('../controllers/userController');
var plan = require('../controllers/planController');
var firm = require('../controllers/firmController');
var coUser = require('../controllers/coUserController');
var client = require('../controllers/clientController');
var executive = require('../controllers/executiveController');
var mediahouse = require('../controllers/mediahouseController');
var ratecard = require('../controllers/ratecardController');
var pdf = require('../controllers/pdfController');
var bckup = require('../controllers/bckup');

router.post('/user/signup', user.signup);
router.post('/user/login', user.login);
router.post('/user/mobile', user.setMobile);
router.post('/user/verify/mobile', user.verifyMobile);
router.get('/plans', plan.getPlans);
router.post('/user/plan', firm.setPlan);
router.post('/user/co_user', coUser.createCoUser);
router.get('/user/co_user', coUser.getCoUsers);
// router.post('/user/admins', coUser.createAdmins);
// router.get('/user/admins', coUser.getAdmins);

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
router.post('/user/forgotpassword/', user.sendPasswordResetEmail);
router.post('/user/forgotPassword/',user.resetPassword);
router.delete('/user/co_user/:id', user.deleteUser);

router.post('/user/client', client.createClient);
router.get('/user/clients', client.getClients);
router.get('/user/client/:id', client.getClient);
router.delete('/user/client/:id', client.deleteClient);
router.patch('/user/client', client.updateClient);
router.get('/user/clients/:keyword', client.queryClients);
router.post('/user/client/picture/:id', client.profileImage);

router.post('/user/executive', executive.createExecutive);
router.get('/user/executives', executive.getExecutives);
router.get('/user/executive/:id', executive.getExecutive);
router.delete('/user/executive/:id', executive.deleteExecutive);
router.patch('/user/executive', executive.updateExecutive);
router.get('/user/executives/:keyword', executive.queryExecutives);
router.post('/user/executive/picture/:id', executive.profileImage);


router.post('/user/mediahouse', mediahouse.createMediahouse);
router.get('/user/mediahouses', mediahouse.getLocalMediahouses);
router.get('/user/mediahouses/global', mediahouse.getGlobalMediahouses);
router.get('/user/mediahouse/:id', mediahouse.getMediaHouse);
router.delete('/user/mediahouse/:id', mediahouse.deleteMediahouse);
router.patch('/user/mediahouse', mediahouse.updateMediaHouse);
router.get('/user/mediahouses/:keyword', mediahouse.queryMediaHouse);

router.post('/user/ratecard', ratecard.createRatecard);
router.get('/user/ratecards', ratecard.getLocalRatecards);
router.get('/user/ratecards/global', ratecard.getGlobalRatecards);
router.get('/user/ratecard/:id', ratecard.getRatecard);
router.delete('/user/ratecard/:id', ratecard.deleteRatecard);
router.patch('/user/ratecard', ratecard.updateRatecard);
router.get('/user/ratecards/:keyword', ratecard.queryRatecards);
router.post('/user/invoice/razorpay', pdf.generateRazorpayInvoice);


router.get('/user/mail', bckup.sendMailFromMailgun);
module.exports = router;
