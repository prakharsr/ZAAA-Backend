var config = require('../../config');
var RateCard = require('../models/Ratecard');
var userController = require('./userController');
var firmController = require('./firmController');
var ratecardController = require('./ratecardController');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');


var xl = require('excel4node');
var wb = new xl.Workbook();
var options = {
    margins: {
        left: 1.5,
        right: 1.5
    }
};
var ws = wb.addWorksheet(options);

ws.cell(1,1).string('mallu');
ws.cell(1,2).string('mallu');
ws.cell(2,1).string('mallu');
ws.cell(2,2).string('mallu');
ws.cell(2,3).string('mallu');
ws.cell(2,4).string('mallu');
ws.cell(2,5).string('mallu');
wb.write('excel.xlsx');
ws.addDataValidation({
    type: 'list',
    allowBlank: true,
    prompt: 'Choose from dropdown',
    error: 'Invalid choice was chosen',
    showDropDown: true,
    sqref: 'C1:C5',
    formulas: [
        '=$B$1:$B$5'
    ]
});

module.exports.createExcel=function(request, response){
var plans = Plan.find({}, function(err, plans){
if(err){
    response.send({
        success:false,
        err:err + ""
    });
}
else{

    
}

});
};
