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

var AdminSchema = new mongoose.Schema({
    status : {
        type : Number,
        default : 0,
    },
    empno :{
        type:String,
        unique: true
    },
    name: String,
    dob: {
        day:String,
        month:String,
        year:String
    },
    gender: String,
    MaritalStatus: String,
    CurrentAddress:{
        pincode:String,
        address:String,
        city:String,
        state:String
    },
    PermanentAddress:{
        pincode:String,
        address:String,
        city:String,
        state:String
    },
    AadharNo: String,
    PfNo: String,
    ESINo: String,
    photo : {
        type:String,
        default:'/images/profile.jpg'
    },
    signature : {
        type:String,
        default:'/images/sign.png'
    },
    designation:String,
    phone : String,
    authyId:String,
    password : String,
    createdOn : Date,
    mobile_verified : {
        type:Boolean,
        default: false
    },
    email_verified : {
        type:Boolean,
        default:false
    },
    privileges:{
        type: Number,
        default: 0
    }
},
{
    _id: true // disables the creation of the virtual "id" property
});

var SALT_WORK_FACTOR = 10;
AdminSchema.pre('save', function(next) {
    var self = this;
    if (!self.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(self.password, salt, function(err, hash) {
            if (err) return next(err);
            self.password = hash;
            next();
        });
    });
});

AdminSchema.methods.comparePassword = function(candidatePassword, cb) {
    var self = this;
    bcrypt.compare(candidatePassword, self.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch, self);
    });
    
    
}; 

AdminSchema.methods.sendPasswordResetMail = function(cb){
    var self=this;
    var mailOptions = {
    from: "sonumeewa@gmail.com", // sender address
    to: self.email, // list of receivers
    subject: "Reset Password",// Subject lin
    text: "Here is the link to reset your password", // plaintext body
    html:  "<p>click here: http://www.adagencymanager.com/api/user/reset/password/"+ self._id+Date.now()+ "</p>"// html body
};

// send mail with defined transport object
transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Gmail Port
    auth: {
        user: "sonumeewa@gmail.com", // Gmail id
        pass: "Vipul@1997"  // Gmail password
    },
    secure:true//,proxy: process.env.http_proxy||"" 
});

transporter.sendMail(mailOptions,cb, function(error, info){
    if(error){
        cb.call(err, null);
    }
    else{

    console.log('Message sent: ' + info.response);
    cb.call(null, self);

    }
});

};  

AdminSchema.plugin(timestamps);
        
module.exports = mongoose.model('User', AdminSchema);
