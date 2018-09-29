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
function quartersLeft(firm){
    if(firm.plan.expiresOn - new Date() >= 0)
    return Math.floor((firm.plan.expiresOn - new Date())/92);
    else
    return 0;
}
function calcDuration(firm, newPlan){
    if(firm.plan.name == 'trial'){
        console.log(new Date(firm.plan.expiresOn));
        if(new Date(firm.plan.expiresOn) - new Date() >= 0)
            return {
                from: firm.plan.expiresOn,
                upto: new Date(new Date().setDate(firm.plan.expiresOn.getDate() + newPlan.duration ))
            }
        else{
            return {
                from: new Date(),
                upto:  new Date(new Date().setDate(new Date().getDate() + newPlan.duration ))
            }
        }
    }
    else{
        if(new Date(firm.plan.expiresOn) - new Date() >= 0){
            if(newPlan._id === firm.plan.planID){
                return {
                    from: firm.plan.expiresOn,
                    upto: new Date(new Date().setDate(firm.plan.expiresOn.getDate() + newPlan.duration ))
                }
            }
            else{
                return {
                    from: new Date(),
                    upto:  new Date(new Date().setDate(new Date().getDate() + newPlan.duration ))
                }
            }
        }
        else{
            return {
                from: new Date(),
                upto:  new Date(new Date().setDate(new Date().getDate() + newPlan.duration ))
            }
        }
    }
}

module.exports.getPlans2 = async function(request,response){
    var user = response.locals.user;
    var firm = response.locals.firm;
    try{
        var plans=[];
        var dur=[];
        var trial = await Plan.findOne({ name: "trial"});
        var small = await Plan.findOne({ name: "Small"});
        var medium = await Plan.findOne({ name: "Medium"});
        var large = await Plan.findOne({ name: "Large"});
        if(firm.plan.planID == undefined || firm.plan.planID == null ){
            plans = await Plan.find({})
            dur = [
                {from: new Date(), upto: new Date(new Date().setDate(new Date().getDate()+ trial.duration))},
                {from: new Date(), upto: new Date(new Date().setDate(new Date().getDate()+ small.duration))},
                {from: new Date(), upto: new Date(new Date().setDate(new Date().getDate()+ medium.duration))},
                {from: new Date(), upto: new Date(new Date().setDate(new Date().getDate()+ large.duration))}
            ]
        }
        else if (firm.plan.planID.equals(trial._id)){
            plans = [small, medium, large];
            dur = [ calcDuration(firm, small), calcDuration(firm , medium), calcDuration(firm, large)]
        }
        else if (firm.plan.planID.equals(small._id)){
            medium.cost -= small.cost*quartersLeft(firm)/4;
            large.cost -= small.cost*quartersLeft(firm)/4;
            plans = [small, medium, large]
            dur = [ calcDuration(firm, small), calcDuration(firm , medium), calcDuration(firm, large)]

        }
        else if (firm.plan.planID.equals(medium._id)){
            large.cost -= medium.cost*quartersLeft(firm)/4;
            plans = [small, medium, large]
            dur = [ calcDuration(firm, small), calcDuration(firm , medium), calcDuration(firm, large)]

        }
        else if (firm.plan.planID.equals(large._id)){
            plans = [small, medium, large]
            dur = [ calcDuration(firm, small), calcDuration(firm , medium), calcDuration(firm, large)]

        }
        response.send({
            success:true,
            plans:plans,
            dur:dur,
            user:user,
            firm: firm
        })
    }
    catch(err){
        response.send({
            success:false,
            msg: 'error' + err
        })
        return;
    }
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

