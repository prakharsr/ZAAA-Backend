var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var nodemailer = require('nodemailer');

var scheduling=new mongoose.Schema({
    Person:String,
    Designation:String,
    MobileNo:String,
    DeskExtension:String,
    EmailId:String,
    Departments: [{department:String}]
    });

var MediahouseSchema = new mongoose.Schema({
OrganizationName:String,
PublicationName:String,
NickName:String,
MediaType:String,
Address:{
    edition:String,
    address:String,
    city:String,
    state:String
},
OfficeLandline:String,
Scheduling:[scheduling],

firm : {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Firm"
},
global:{
    type:Boolean,
    default:false
}
});
module.exports = mongoose.model('MediaHouse', MediahouseSchema);
