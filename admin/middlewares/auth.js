var userController = require('../controllers/adminController');
var config = require('../../config');
var Admin = require('../models/Admin');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;


var unAuthRoutes = [
    {method:'POST',path:'/adminapi/signup'},
    {method:'POST',path:'/adminapi/login'},
    {method:'POST',path:'/adminapi/forgotPassword'}
];

function getAdmin(token,req,res, cb){
    jwt.verify(token, config.SECRET, function(err,decoded){
        Admin.findById(decoded.id, function(err, doc) {
            if (err || !doc) {
                return  cb(err,null);
            }
            else{
                return cb(null, doc);
            }
        });
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
    var query = {method:req.method,path:req.originalUrl};
    if(JSON.stringify(unAuthRoutes).indexOf(JSON.stringify(query)) >= 0)
    {
        next();
    }
    else{
        var token = getToken(req.headers);
        var admin = getAdmin(token,req,res, function(err, admin){
            if(err||!admin){
                console.log(err, admin)
                console.log("User not found");
            }
            else{
                res.locals.admin = admin;
                next();
            }
        })
    }
};