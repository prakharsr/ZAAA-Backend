var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var nodemailer = require('nodemailer');
var timestamps = require('mongoose-timestamp');

var TicketSchema = new mongoose.Schema({
    subject: String,
    details: String,
    user : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status: Number,
    firm:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
});

TicketSchema.plugin(timestamps);
module.exports = mongoose.model('Ticket', TicketSchema);
