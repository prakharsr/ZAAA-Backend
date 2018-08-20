var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var nodemailer = require('nodemailer');
var timestamps = require('mongoose-timestamp');

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
PublicationName:
            {
                type:String,
                required: true
            },
NickName:String,
MediaType:String,
Language:String,

pullouts:[{Name:String, Language:String, Frequency:String, Remark:String}],

Address:{
    pincode:String,
    edition:
        {
            type:String,
            required: true
        },
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
    ref:"Firm",
    required:true
},
global:{
    type:Boolean,
    default:false
}
});
MediahouseSchema.index({firm:1,PublicationName: 1, "Address.edition":1 }, {unique: true});

MediahouseSchema.plugin(timestamps);
module.exports = mongoose.model('MediaHouse', MediahouseSchema);
