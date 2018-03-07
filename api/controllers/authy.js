var config = require('../../config');
var User = require('../models/User');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;


module.exports.sendAuthyToken = function(request, response, cb) {
    var self = this;
    
    if (!self.authyId) {
        // Register this user if it's a new user
        authy.register_user(self.email, self.phone, 91,
            function(err, response) {
                
                if (err || !response.user){ 
                    return cb.call(self, err);}
                    self.authyId = response.user.id;
                    self.save(function(err, doc) {
                        if (err || !doc) return cb.call(self, err);
                        self = doc;
                        sendToken();
                    });
                });
            } else {
                // Otherwise send token to a known user
                
                sendToken();
            }
            
            // With a valid Authy ID, send the 2FA token for this user
            function sendToken() {
                authy.request_sms(self.authyId, true, function(err, response) {
                    cb.call(self, err);
                });
            }
        };