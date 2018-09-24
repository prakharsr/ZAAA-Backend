var Plan = require('../models/Plan');


//http://localhost:8000/api/get/plans

module.exports.getPlans = function(request,response){
    var user = response.locals.user;
    var plans = Plan.find({},null, {sort: {cost: 1}},function(err, plans){ 
        if(err){
            console.log("here" +err);
        }
        else{
            if(plans.length== 0){
                plan0 = new Plan({
                    name : "trial",
                    cost : 0,
                    maxUsers : 3,
                    maxAdmins : 1,
                    duration:15
                });
                plan1 = new Plan({
                    name : "Small",
                    cost : 5000,
                    maxUsers : 2,
                    maxAdmins : 1,
                    duration:30
                });
                
                plan2 = new Plan({
                    name : "Medium",
                    cost : 10000,
                    maxUsers : 5,
                    maxAdmins : 2,
                    duration:45
                });
                
                plan3 = new Plan({
                    name : "Large",
                    cost : 15000,
                    maxUsers : 11,
                    maxAdmins : 3,
                    duration:90
                });
                plan0.save();
                plan1.save();
                plan2.save();
                plan3.save();
                
                response.send({
                    success:true,
                    plans:[plan0, plan1, plan2, plan3]
                })
                
            }else{
                response.send({
                    success : true,
                    plans : plans,
                    email: user.email,
                    phone:user.phone
                }); 
                
            }
            
        }
    });
};


module.exports.getCurrentPlan=function(request, response){
    var user = response.locals.user;
    var firm = response.locals.firm;
    Plan.findById(mongoose.mongo.ObjectId(firm.plan.planID), function(err,plan){
        if(err){
            response.send({
                success:false,
                msg:"error in finding plan" + err,
                
            });
        }
        if(!plan){
            response.json({
                success:false,
                msg:"plan not found for the firm ",
                firm:firm
            });
        }
        else{
            response.json({
                success:false,
                msg:"plan  obtained ",
                user:user,
                firm:firm,
                plan:plan
            });
        }
    });
}

