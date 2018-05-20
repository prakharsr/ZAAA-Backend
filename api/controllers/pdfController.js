var mongoose = require('mongoose');
var pdf = require('html-pdf');
var fs = require('fs');
var path = require('path');
var Firm = require('../models/Firm');
var User = require('../models/User');
var config =  require('../../config');
var usercontroller = require('./userController');
var api_key = config.mailgun_api_key;
var DOMAIN = config.DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
var ReleaseOrder = require('../models/ReleaseOrder');

module.exports.generateRazorpayInvoice = function(request,response){
response.send({success:true});
}
