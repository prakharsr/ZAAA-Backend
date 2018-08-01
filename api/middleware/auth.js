var config = require('../../config');
var RateCard = require('../models/Ratecard');
var userController = require('../controllers/userController');
var firmController = require('../controllers/firmController');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var MediaHouse = require('../models/MediaHouse');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;


var unAuthRoutes = [
    {method:'POST',path:'/api/user/signup'},
    {method:'POST',path:'/api/user/login'},
    {method:'POST',path:'/api/user/forgotPassword'}
];

function getUser(token,req,res, cb){
    var decoded = jwt.verify(token, config.SECRET, function(err,decoded){
        User.findById(decoded.id, function(err, doc) {
            if (err || !doc) {
                return  cb(err,null);
            }
            else{
                return cb(null, doc);
            }
        });
    });
}
function getFirm(user,req,res, cb){
    var id = user.firm;
        Firm.findById(id, function(err, doc) {
            if (err || !doc) {
                return  cb(err,null);
            }
            else{
                return cb(null, doc);
            }
        });
}
        
function getToken(headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

module.exports = function(req, res, next){
    //var query = {method:req.method,path:req.originalUrl};
    //if(JSON.stringify(unAuthRoutes).indexOf(JSON.stringify(query)) >= 0)
    if (unAuthRoutes.findIndex(element => element.method == req.method && element.path == req.originalUrl) != -1)
    {
        next();
    }
    else{
        var token = getToken(req.headers);
        var user = getUser(token,req,res, function(err, user){
            if(err||!user){
                console.log(err, user)
                console.log("User not found");
            }
            else{
                    var firm = getFirm(user, req, res, function(err, firm){
                        if(err||!firm){
                            console.log(err, user)
                            console.log("Firm not found");
                        }
                        else{
                            res.locals.user = user;
                            res.locals.firm = firm;
                            next();
                        }
                    })
            }
        })
    }
};