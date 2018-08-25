var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var nodemailer = require('nodemailer');
var mailgun = require("mailgun-js");
var api_key = config.mailgun_api_key;
var DOMAIN = config.DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
var timestamps = require('mongoose-timestamp');

var CategorySchema = new mongoose.Schema({
    name:String,
    level:Number,
    parent:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
},
{
    _id: true // disables the creation of the virtual "id" property
});
CategorySchema.index({name:1,level: 1,parent:1,}, {unique: true});
CategorySchema.plugin(timestamps);
module.exports = mongoose.model('Category', CategorySchema);
