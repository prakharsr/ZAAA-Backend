var Admin = require('../models/Admin');
var Category = require('../models/Categories');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

module.exports.createCategory = function(request, response){
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

module.exports.getCategories = function(request, response){
    var admin = response.locals.admin;
    if(request.body.level ==0){
        var query = {
            level:0
        };
    }
    else if(request.body.level > 0 && parent !==null)
    {
        var query = {
            level:request.body.level,
            parent:request.body.parent
        };
        
    }
    Category.find(query,function(err, categories){ 
        if(err){
            console.log("here" +err);
        }
        else{
            response.send({
                success : true,
                categories: categories
            }); 
        }
    });
};

