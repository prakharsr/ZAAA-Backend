var config = require('../../config');
var Plan = require('../models/Plan');
var User = require('../models/User');
var jwt = require('jsonwebtoken');

//http://localhost:8000/api/get/plans
module.exports.getPlans = function(req,res){
    if(err){
        console.log(err);
        throw err;
    }
    var plan1 = new Plan({
        cost : 1000,
        name : easy,
        maxUsers : 2,
        maxAdmins : 1,
        description : "biyatch"
    });
    var plan2 = new Plan({
        cost : 10000,
        name : medium,
        maxUsers : 5,
        maxAdmins : 2,
        description : "biyatch I'm"
    });
    var plan3 = new Plan({
        cost : 100000,
        name : hard,
        maxUsers : 11,
        maxAdmins : 3,
        description : "biyatch I'm rollin!"
    });

    var plans = [plan1, plan2, plan3];

    res.send({
        success : true,
        plans : plans
    });  
};

//http://localhost:8000/api/set/plans
module.exports.postPlan = function(req,res){
    var token = getToken(req.header);
    
    if(token){
        var decoded = jwt.verify(token, config.secret);
        User.findById(decoded.id, function(err,user){
            if(err){
                console.log(err);
                throw err;
            }
            if(!user){
                return res.status(403).send({
                    success : false,
                    msg : "Auth failed"
                });
            }
            else{
                
            }
        });
    }
    else{
        return res.status(403).send({
            success : false,
            msg : "No Token Provided"
        });
    }
};

getToken = function(headers) {
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
};