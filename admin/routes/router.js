var express = require('express');
var router = express.Router();
var admin = require('../controllers/adminController');

router.post('/signup', admin.signup);
router.post('/login', admin.login);
router.post('/image', admin.profileImage);
router.delete('/image', admin.deleteProfileImage);
router.delete('/sign', admin.deleteSignature);

router.post('/sign', admin.signature);
router.post('/profile', admin.setUserProfile);
router.post('/changePassword', admin.changePassword);
router.delete('/:id', admin.deleteUser);

module.exports = router;