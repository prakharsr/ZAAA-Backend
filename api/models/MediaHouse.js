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

pullouts:[{Name:String, Language:String, Frequency:String, Remark:String}],

Address:{
    pincode:String,
    edition:String,
    address:String,
    city:String,
    state:String
},
OfficeLandline:{
    std: String,
    phone:String
},
GSTIN:{
    GSTType:String,
    GSTNo:String
},
Scheduling:[scheduling],
Remark:String,

firm : {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Firm"
},
global:{
    type:Boolean,
    default:false
}
});
MediahouseSchema.index({firm:1,PublicationName: 1, "Address.edition":1 }, {unique: true});
module.exports = mongoose.model('MediaHouse', MediahouseSchema);
