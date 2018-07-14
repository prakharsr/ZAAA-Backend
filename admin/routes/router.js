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
router.get('/admins', admin.getAdmins);
router.post('/attachments/aadhar', admin.Aadhaar);
router.post('/attachments/bank', admin.bankAttachment);
router.post('/attachments/id', admin.IDAttachment);
router.post('/attachments/other1', admin.OtherAtt1);
router.post('/attachments/other2', admin.OtherAtt2);
router.post('/attachments/other3', admin.OtherAtt3);


module.exports = router;