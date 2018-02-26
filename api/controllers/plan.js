var config = require('../../config');
var Plan = require('../models/Plan');
var User = require('../models/User');
var jwt = require('jsonwebtoken');

//http://localhost:8000/api/get/plans

module.exports.getPlans = function(req,res){
    plan0 = new Plan({
        name : "trial",
        cost : 0,
        maxUsers : 3,
        maxAdmins : 1,
    });
    plan1 = new Plan({
        name : "Small",
        cost : 5000,
        maxUsers : 2,
        maxAdmins : 1,
    });

    plan2 = new Plan({
        name : "Medium",
        cost : 10000,
        maxUsers : 5,
        maxAdmins : 2,
    });

    plan3 = new Plan({
        name : "Large",
        cost : 15000,
        maxUsers : 11,
        maxAdmins : 3,
    });

    var plans = Plan.find({},null, {sort: {cost: 1}},function(err, plans){

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


