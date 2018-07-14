var Ticket = require('../../api/models/Ticket');
var User = require('../../api/models/User');
var Admin = require('../models/Admin');
var perPage=20;


function formQuery(request){
    return new Promise((resolve, reject) => {
        var query;
        if(request.body.status) query[status]=request.body.status
        if(request.body.insertionPeriod){
            var to = new Date()
            var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.insertionPeriod);
            query['createdAt']={$gte: from, $lte:to} 
        }
        resolve(query);    
    })
}

module.exports.listTickets = function(request,response){
    var query = formQuery(request);
    Ticket.find(query)
    .limit(perPage)
    .skip((perPage * request.body.page) - perPage)
    .exec(function(err, tickets){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            Ticket.count(query, function(err, count){
                response.send({
                    success:true,
                    tickets: tickets,
                    page: request.body.page,
                    perPage:perPage,
                    pageCount: Math.ceil(count/perPage)
                });
            })
            
        }
    });
}

module.exports.changeStatus = async function(request,response){
    var admin = response.locals.admin;
    try{
        var ticket = await Ticket.findById(request.body.id);
        ticket.status=request.body.status;
        ticket.save(err => {
            if(!err){
                response.send({
                    success: true,
                    msg: 'Status Changed Successfully'
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