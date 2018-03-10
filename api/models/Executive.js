var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var nodemailer = require('nodemailer');


var personalDetails=new mongoose.Schema({
    Photo:String,
    DateOfBirth:Date,
    Anniversary:Date
    });
var ExecutiveSchema = new mongoose.Schema({
    OrganizationName:String,
    CompanyName:String,
    ExecutiveName:String,
    Designation:String,
    Department:String,
    MobileNo:String,
    EmailId:String,
    PersonalDetails:{
        type:personalDetails
    },
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
    
});
module.exports = mongoose.model('Executive', ExecutiveSchema);

