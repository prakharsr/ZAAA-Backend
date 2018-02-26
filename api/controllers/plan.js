var config = require('../../config');
var Plan = require('../models/Plan');
var User = require('../models/User');
var jwt = require('jsonwebtoken');

//http://localhost:8000/api/get/plans
module.exports.getPlans = function(req,res){
    var plans = Plan.find({}, function(err, plans){
            if(err){
                console.log("here" +err);
            }
            else{
                res.send({
                    success : true,
                    plans : plans
                }); 
            }
    });
};


