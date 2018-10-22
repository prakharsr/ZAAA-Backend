var Ticket = require('../../api/models/Ticket');
var User = require('../../api/models/User');
var Admin = require('../models/Admin');
var Firm  = require('../../api/models/Firm');
var perPage=20;


function formQuery(request){
    return new Promise((resolve, reject) => {
        var query;
        if(request.body.status) query['FirmStatus']=request.body.status;
        if(request.body.creationPeriod){
            var to = new Date()
            var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.insertionPeriod);
            query['createdAt']={$gte: from, $lte:to} 
        }
        resolve(query);    
    })
}

module.exports.listFirms = async function(request,response){
    var query = await formQuery(request);
    Firm.find(query)
    .limit(perPage)
    .skip((perPage * request.body.page) - perPage)
    .exec(function(err, firms){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            Firm.count(query, function(err, count){
                response.send({
                    success:true,
                    firms: firms,
                    page: request.body.page,
                    perPage:perPage,
                    pageCount: Math.ceil(count/perPage)
                });
            })
            
        }
    });
}

module.exports.firmData = function(request,response){
    Firm.findById(request.body.id,function(err, firm){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            User.find({
                firm:firm._id
            })
            .exec(function(err, users){
                if(err){
                    console.log({
                        success:false,
                        msg:"Error Occured"
                    })
                }
                else{
                    var max_users, max_admins;
                    if(firm.plan.name == 'trial')
                    {
                        max_users = 3;
                        max_admins = 1;
                    }
                    if(firm.plan.name == 'Small')
                    {
                        max_users = 2;
                        max_admins = 1;
                    }
                    if(firm.plan.name == 'Medium')
                    {
                        max_users = 5;
                        max_admins = 2;
                    }
                    if(firm.plan.name == 'Large')
                    {
                        max_users = 11
                        max_admins = 3;
                    }
                    
                    response.send({
                        success:true,
                        firm:firm,
                        users:users,
                        max_users:max_users,
                        max_admins: max_admins

                    })
                }
            })
        }
    });
}
module.exports.changeFirmStatus = async function(request,response){
    var admin = response.locals.admin;
    try{
        var firm = await Firm.findById(request.body.id);
        firm.FirmStatus=request.body.status;
        firm.save(err => {
            if(!err){
                response.send({
                    success: true,
                    msg: 'Status Changed Successfully',
                    status:firm.FirmStatus
                })
            }
        })
    }
    catch(err){
        response.send({
            success: false,
            msg: err
        })
    }
}