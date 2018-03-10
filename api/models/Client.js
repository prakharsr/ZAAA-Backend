var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var nodemailer = require('nodemailer');

var contactDetails = new mongoose.Schema({
    Name:String,
    Designation:String,
    Department:String,
    MobileNo:String,
    EmailId:String,
    Photo:String,
    DateOfBirth:Date,
    Anniversary:Date    
});

var ClientSchema = new mongoose.Schema({
    OrganizationName:String,
    CompanyName:String,
    NickName:String,
    CategoryType:String,
    AddressState:String,
    Landline:String,
    Website:String,
    PanNO:String,
    GSTNo:String,
    ContactPerson:contactDetails,
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
});
module.exports = mongoose.model('Client', ClientSchema);
