var express = require('express');
var router = express.Router();
var excel = require('../controllers/excelController');

router.post('/import/ratecard',excel.ratecardExcelImport);
router.post('/import/mediahouse',excel.mediahouseExcelImport);
router.post('/export/ratecard',excel.generateRateCardSheet);
router.post('/export/mediahouse',excel.generateMediaHouseSheet);

module.exports = router;
