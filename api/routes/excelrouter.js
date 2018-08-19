var express = require('express');
var router = express.Router();
var excel = require('../controllers/excelController');

router.post('/user/excel/import/ratecard',excel.ratecardExcelImport);
router.post('/user/excel/import/client',excel.clientExcelImport);
router.post('/user/excel/import/executive',excel.executiveExcelImport);
router.post('/user/excel/import/mediahouse',excel.mediahouseExcelImport);
router.post('/user/excel/export/ratecard',excel.generateRateCardSheet);
router.post('/user/excel/export/client',excel.generateClientSheet);
router.post('/user/excel/export/executive',excel.generateExecutiveSheet);
router.post('/user/excel/export/mediahouse',excel.generateMediaHouseSheet);

module.exports = router;
