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
    var category = new Category({
        name:request.body.name,
        level:request.body.level,
        parent:request.body.parent
    });
    category.save(function(err, doc){
        if(err){
            if(err.code == 11000){
                response.send({
                    success : false,
                    msg : "category already exist"
                });
            }
            else{
                
                response.send({
                    success : false,
                    msg : err
                });
            }
        }
        else {
            response.json({
                success:true,
                category:category
            });
        }
    });
}

module.exports.getCategories = function(request, response){
    var admin = response.locals.admin;

    var query = {};

    if(request.body.level == 0){
        query = {
            level:0
        };
    }
    else if(request.body.level > 0 && request.body.parent !=null)
    {
        query = {
            level: request.body.level,
            parent: mongoose.mongo.ObjectId(request.body.parent)
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


module.exports.searchCategories = function(request, response){
    var admin = response.locals.admin;
    
    Category.find({
        'name': { $regex: request.params.keyword+"", $options:"i" }
    })
    .exec(async function(err, categories){ 
        if(err){
            console.log("here" +err);
        }
        else{
            var catarray = [];
            for (var i = 0; i < categories.length; ++i) {
                var element = categories[i];

                var array = [];  
                array.push(element);  
                var level = element.level;
                var parent = element.parent;
                while(level-- > 0){
                    try{
                    var category = await Category.findById(mongoose.mongo.ObjectId(parent));
                    array.push(category);
                    parent = category.parent;
                    }
                    catch(err){
                        console.log(err);
                    }
                    
                }
                catarray.push(array);
            }
            response.send({
                success : true,
                categories: catarray
            }); 
        }
    });
};