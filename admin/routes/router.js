var express = require('express');
var router = express.Router();
var admin = require('../controllers/adminController');

router.post('/admin/signup', admin.signup);
router.post('/admin/login', admin.login);
router.post('/admin/image', admin.profileImage);
router.delete('/admin/image', admin.deleteProfileImage);
router.delete('/admin/sign', admin.deleteSignature);

router.post('/admin/sign', admin.signature);
router.post('/admin/profile', admin.setUserProfile);
router.post('/admin/changePassword', admin.changePassword);
router.post('/admin/forgotPassword', admin.sendPasswordResetEmail);
router.post('/admin/resetPassword',admin.resetPassword);
router.delete('/admin/:id', admin.deleteUser);

module.exports = router;