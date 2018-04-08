var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var nodemailer = require('nodemailer');


var ClientSchema = new mongoose.Schema({
    OrganizationName:String,
    CompanyName:String,
    NickName:String,
    CategoryType:String,
    Address:{
        pin:String,
        address:String,
        city:String,
        state:String
    },
    stdNo:String,
    Landline:String,
    Website:String,
    PanNO:String,
    GSTNo:String,
    ContactPerson:[{
        Name:String,
        Designation:String,
        Department:String,
        MobileNo:String,
        stdNo:String,
        Landline:String,
        EmailId:String,
        Photo:{
            type: String,
            default: '/images/profile.jpg'
        },
        DateOfBirth:Date,
        Anniversary:Date    
    }],
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
});
module.exports = mongoose.model('Client', ClientSchema);
