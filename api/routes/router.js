var express = require('express');
var router = express.Router();
var user = require('../controllers/userController');
var plan = require('../controllers/planController');
var firm = require('../controllers/firmController');
var coUser = require('../controllers/coUserController');
var client = require('../controllers/clientController');
var executive = require('../controllers/executiveController');
var mediahouse = require('../controllers/mediahouseController');
var releaseOrder= require('../controllers/releaseorderController');
var mediahouseInvoice= require('../controllers/mediahouseInvoiceController');
var reports = require('../controllers/reportsController');
var pdf= require('../controllers/pdfController');
var ratecard = require('../controllers/ratecardController');
var invoice = require('../controllers/invoiceController');
var taxation = require('../controllers/taxation');
var receipt = require('../controllers/receiptController');
var dashboard = require('../controllers/dashboard');
var notes = require('../controllers/creditDebit');
var excel = require('../controllers/excelController');
var ticket = require('../controllers/ticketController');
var auth  = require('../middleware/auth')


router.get('/user/check', user.getCurrentUserDetails);
router.post('/user/signup', user.signup);
router.post('/user/login', user.login);
router.post('/user/logout', user.logout);
router.post('/user/mobile', user.setMobile);
router.post('/user/verify/mobile', user.verifyMobile);
router.get('/plans', plan.getPlans);
router.post('/user/plan', firm.setPlan);
router.post('/user/plan/invoice', pdf.generateRazorpayInvoice);
router.post('/user/co_user', coUser.createCoUser);
router.get('/user/co_user', coUser.getCoUsers);
// router.post('/user/admins', coUser.createAdmins);
// router.get('/user/admins', coUser.getAdmins);

router.post('/user/role' , coUser.setRole);
router.get('/user/role/:id', coUser.getRoles);

router.post('/user/image', user.profileImage);
router.delete('/user/image', user.deleteProfileImage);
router.delete('/user/sign', user.deleteSignature);

router.post('/user/sign', user.signature);
router.get('/user/profile', user.getUserProfile);
router.post('/user/profile', user.setUserProfile);
router.get('/firm/profile', firm.getFirmProfile);
router.get('/firm/users', firm.getFirmUsers);
router.post('/firm/profile', firm.setFirmProfile);
router.get('/firm/terms', firm.getTermsAndCondition);
router.post('/firm/terms', firm.setTermsAndCondition);
router.post('/firm/logo', firm.logoImage);
router.delete('/firm/logo', firm.deleteLogoImage);
router.get('/user', user.getCurrentUser);
router.get('/firm', firm.getCurrentFirm);
router.get('/plan', plan.getCurrentPlan);
router.post('/user/changePassword', user.changePassword);
router.post('/user/forgotPassword', user.sendPasswordResetEmail);
router.post('/user/resetPassword',user.resetPassword);
router.delete('/user/co_user/:id', user.deleteUser);
router.post('/user/notifications', user.getNotifications);
router.get('/user/lastseen', user.getLastSeen);
router.post('/user/lastseen', user.setLastSeen);

router.post('/user/client', client.createClient);
router.get('/user/clients/:page', client.getClients);
router.get('/user/client/:id', client.getClient);
router.delete('/user/client/:id', client.deleteClient);
router.patch('/user/client', client.updateClient);
router.get('/user/clients/search/:keyword', client.queryClients);
router.post('/user/client/picture/:id', client.profileImage);

router.post('/user/executive', executive.createExecutive);
router.get('/user/executives/:page', executive.getExecutives);
router.get('/user/executive/:id', executive.getExecutive);
router.delete('/user/executive/:id', executive.deleteExecutive);
router.patch('/user/executive', executive.updateExecutive);
router.get('/user/executives/search/:keyword', executive.queryExecutives);
router.post('/user/executive/picture/:id', executive.profileImage);
router.get('/user/executives/search/:ExecutiveName/:keyword', executive.queryExecutiveOrganization);

router.post('/user/mediahouse', mediahouse.createMediahouse);
router.post('/user/mediahouseInRO', mediahouse.createMediahouseFromRO);
router.get('/user/mediahouses/global/:page', mediahouse.getGlobalMediahouses);
router.get('/user/mediahouses/:page', mediahouse.getLocalMediahouses);
router.get('/user/mediahouse/:id', mediahouse.getMediaHouse);
router.delete('/user/mediahouse/:id', mediahouse.deleteMediahouse);
router.patch('/user/mediahouse', mediahouse.updateMediaHouse);
router.get('/user/mediahouses/search/:keyword', mediahouse.queryMediaHouse);
router.get('/user/mediahouses/search/:PublicationName/:keyword', mediahouse.queryMediaHouseEdition);

router.post('/user/ratecard', ratecard.createRatecard);
router.get('/user/ratecards/global/:page', ratecard.getGlobalRatecards);
router.get('/user/ratecards/:page', ratecard.getLocalRatecards);
router.get('/user/ratecard/:id', ratecard.getRatecard);
router.delete('/user/ratecard/:id', ratecard.deleteRatecard);
router.patch('/user/ratecard', ratecard.updateRatecard);
router.get('/user/ratecards/search/:keyword', ratecard.queryRatecards);


router.post('/user/releaseorder', releaseOrder.createRO);
router.patch('/user/releaseorder', releaseOrder.updateReleaseOrder);
router.post('/user/releaseorder/cancel', releaseOrder.cancelReleaseOrder);
router.get('/user/releaseorders/searchByNo/:keyword', releaseOrder.queryReleaseOrderByNo);
router.post('/user/releaseorders/search', releaseOrder.queryReleaseOrder);
router.post('/user/releaseorders/insertions/search', releaseOrder.queryInsertions);
router.get('/user/releaseorders/insertions/:page', releaseOrder.getReleaseOrderInsertions);
router.post('/user/releaseorders/insertions/check', releaseOrder.setInsertionChecks);
router.post('/user/releaseorder/download', releaseOrder.generateROPdf);
router.post('/user/releaseorders/email', releaseOrder.mailROPdf);
router.post('/user/releaseorders/previewHtml', releaseOrder.previewROhtml);
router.get('/user/releaseorders/:page', releaseOrder.getReleaseOrders);
router.get('/user/releaseorder/:id', releaseOrder.getReleaseOrder);
router.post('/user/releaseorder/generate', releaseOrder.queryGenerated);
router.delete('/user/releaseorder/:id', releaseOrder.deleteReleaseOrder);
router.post('/user/releaseorder/categories', releaseOrder.getCategories);
router.get('/category/search/:keyword', releaseOrder.searchCategories);



router.post('/user/invoice', invoice.createInvoice);
router.post('/user/invoice/pre', invoice.getInvoicesForRO);
router.post('/user/invoice/search/', invoice.queryInvoice);
router.post('/user/invoice/download', invoice.generateInvoicePdf);
router.post('/user/invoice/email', invoice.mailInvoicePdf);
router.post('/user/invoice/previewHtml', invoice.previewinvoicehtml);
router.get('/user/invoices/:page', invoice.getInvoices);
router.get('/user/invoice/:id', invoice.getInvoice);
router.delete('/user/invoice/:id', invoice.deleteInvoice);
router.patch('/user/invoice/:id', invoice.updateInvoice);
router.post('/user/invoice/clientPayments', invoice.queryClientPayments);
router.post('/user/invoice/executivePayments', invoice.queryExecutivePayments);

router.post('/user/receipt', receipt.createReceipt);
router.post('/user/receipt/pre', receipt.getReceiptsForInvoice);
router.post('/user/receipt/search/', receipt.queryReceipt);
router.post('/user/receipt/advanced/search/', receipt.queryAdvancedReceipt);
router.post('/user/receipt/download', receipt.generateReceiptPdf);
router.post('/user/receipt/email', receipt.mailReceiptPdf);
router.post('/user/receipt/previewHtml', receipt.previewreceipthtml);
router.post('/user/receipt/advanced', receipt.createAdvancedReciept);
router.post('/user/receipt/advanced/link', receipt.linkRecieptToInvoice);
router.get('/user/receipts/:page', receipt.getReceipts);
router.get('/user/receipt/:id', receipt.getReceipt);
router.delete('/user/receipt/:id', receipt.deleteReceipt);
router.patch('/user/receipt/:id', receipt.updateReceipt);
router.post('/user/receipt/status', receipt.receiptStatus);
router.post('/user/receipt/cancel', receipt.cancelReceipt);

router.post('/user/mediahouseinvoice/', mediahouseInvoice.createMHInvoice);
router.post('/user/mediahouseinvoice/pre', mediahouseInvoice.getMHInvoicesForRO);
router.post('/user/mediahouseinvoice/search', mediahouseInvoice.queryMediaHouseInvoices);
router.post('/user/summarySheet/search', mediahouseInvoice.querySummarySheet);
router.post('/user/summarySheet', mediahouseInvoice.generateSummarySheet);
router.post('/user/summarySheet/generate', mediahouseInvoice.generateSummarySheetPdf);
router.post('/user/summarySheet/mail', mediahouseInvoice.mailSummarySheetPdf);
router.post('/user/mediahouseReceipts/search', mediahouseInvoice.queryMediaHouseReports);
router.post('/user/mediahouseReceipts', mediahouseInvoice.updateReceipts);
router.post('/user/notes/client', notes.createClientNote);
router.post('/user/notes/mediahouse', notes.createMediaHouseNote);
router.post('/user/notes/client/search/', notes.queryClientNote);
router.post('/user/notes/mediahouse/search/', notes.queryMediaHouseNote);
router.post('/user/notes/download', notes.generateClientNotePdf);
router.post('/user/notes/email', notes.mailClientNotePdf);

router.post('/user/invoice/tax/', taxation.queryInvoiceTax);
router.post('/user/invoice/taxSheet/',taxation.generateTaxSheet);

router.post('/user/reports/mediahouse' , reports.mediahouseReports);
router.post('/user/reports/clients' , reports.clientReports);
router.post('/user/reports/executive' , reports.executiveReports);
router.post('/user/reports/invoice' , reports.clientInvoiceReports);
router.post('/user/reports/releaseOrder' , reports.releaseOrderReports);
router.post('/user/reports/receipt' , reports.receiptReports);
router.post('/user/reports/mediahouseInvoice' , reports.mediahouseInvoiceReports);
router.post('/user/reports/mediahouseNotes' , reports.mediahouseNoteReports);
router.post('/user/reports/clientNote' , reports.clientNoteReports);
router.post('/user/reports/ratecard' , reports.ratecardReports);
router.post('/user/reports/insertions', releaseOrder.generateInsertionsSheet);

router.post('/user/token', user.saveToken);

router.post('/user/ticket', ticket.createTicket);
router.post('/user/ticket/search', ticket.queryUserTickets);

router.post('/user/dashboard/releaseorder', dashboard.ROchartData);
router.post('/user/dashboard/invoice', dashboard.InvoiceData);
router.post('/user/dashboard/clientDues', dashboard.DueOverdueData);
router.post('/user/dashboard/clientPayments', dashboard.ClientPaymentsData);
router.post('/user/dashboard/mediahouseinvoice', dashboard.MediahouseInvoiceData);
router.post('/user/dashboard/receiptCheque', dashboard.RecieptsChequeData);
router.post('/user/dashboard/receiptChequeDetails', dashboard.RecieptsChequeDetailsData);
router.post('/user/dashboard/mediahouseInvoiceChequeDetails', dashboard.MHIChequeDetailsData);
router.post('/user/dashboard/mhiCheque', dashboard.MediaHouseInvoiceChequeData);
router.post('/user/dashboard/paidUnpaid', dashboard.PaidUnpaidData);
router.post('/user/dashboard/check', auth, dashboard.check);
module.exports = router;
