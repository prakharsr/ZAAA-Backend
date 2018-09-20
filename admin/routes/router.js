var express = require('express');
var router = express.Router();
var admin = require('../controllers/adminController');
var ticket = require('../controllers/ticketController');
var global = require('../controllers/globalController');
var category = require('../controllers/categoryController');
var notifs = require('../controllers/notificationController');

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

router.post('/ticket/list', ticket.listTickets);
router.post('/ticket/status', ticket.changeStatus);

router.post('/globalmediahouse', global.getGMediaHouse);
router.post('/globalmediahouse/create', global.createGMediahouse);
router.post('/globalmediahouse/update', global.updateGMediahouse);
router.delete('/globalmediahouse/delete/:id', global.deleteGMediahouse);
router.post('/globalratecard', global.getGRateCard);
router.post('/globalratecard/create', global.createGRatecard);
router.post('/globalratecard/update', global.updateGRatecard);
router.delete('/globalratecard/delete/:id', global.deleteGRatecard);

router.post('/category', category.createCategory);
router.post('/category/list', category.getCategories);
router.get('/category/search/:keyword', category.searchCategories);

router.post('/notifications',notifs.getNotifications);
router.delete('/notifications',notifs.deleteNotification);
router.post('/notifications/send',notifs.sendNotifs);
router.post('/ticker/send',notifs.tickerNotification);



module.exports = router;