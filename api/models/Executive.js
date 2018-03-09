var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var nodemailer = require('nodemailer');



var ExecutiveSchema = new mongoose.Schema({
    OrganizationName:String,
    CompanyName:String,
    ExecutiveName:String,
    Designation:String,
    Department:String,
    MobileNo:String,
    EmailId:String,
    PersonalDetails:{
    Photo:String,
    DateOfBirth:Date,
    Anniversary:Date
    }
});
module.exports = mongoose.model('Executive', ExecutiveSchema);
