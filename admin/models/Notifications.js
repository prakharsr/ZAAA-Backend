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

var NotificationSchema = new mongoose.Schema({
    title: String,
    body: String
});

NotificationSchema.plugin(timestamps);
module.exports = mongoose.model('Notification', NotificationSchema);
