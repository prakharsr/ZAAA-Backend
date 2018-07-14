var Admin = require('../models/Admin');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

module.exports.create = function(request, response){
    var category = new category({
        name:request.body.name,
        level:request.body.level,
        parent:request.body.parent
    });
    category.save(function(err, doc){
        if(err){
            if(err.code == 11000){
                res.send({
                    success : false,
                    msg : "category already exist"
                });
            }
            else{
               
                res.send({
                    success : false,
                    msg : err
                });
            }
        }
        else {
            res.json({
                success:true,
                category:category
            });
            
        }
    });
}