var config = require('../../config');
var RateCard = require('../models/Ratecard');
var userController = require('./userController');
var firmController = require('./firmController');
var pdf = require('./pdf');
var User = require('../models/User');
var ReleaseOrder = require('../models/ReleaseOrder');
var Ticket = require('../models/Ticket');
var jwt = require('jsonwebtoken');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var MediaHouse = require('../models/MediaHouse');
var MediaHouseInvoice = require('../models/MediaHouseInvoice');
var Executive = require('../models/Executive');
var Client = require('../models/Client');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;

module.exports.createTicket = (request,response) => {
    var user = response.locals.user;
    var ticket = new Ticket({
        subject: request.body.subject,
        details: request.body.details,
        status: 0,
        user: user._id,
        firm:user.firm
    });
    
    ticket.save((err,doc) => {
        if(err){
            response.send({
                success:false,
                msg: 'Cannot save ticket'
            });
        }
        else{
            response.send({
                success: true,
                msg: 'ticket generated with ticket no'+ doc._id
            })
        }
    })
}


function formQuery(date, user, request){
    return new Promise((resolve, reject) => {
        var query = {'user':user._id};
        if(request.body.insertionPeriod){
            var to = new Date()
            var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.insertionPeriod);
            query['createdAt']={$gte: from, $lte:to} 
        }
        resolve(query);    
    })
}


module.exports.queryUserTickets = async function(request, response){
    var user = response.locals.user;
    var date = (request.body.date)?(request.body.date):null;
    var query = await formQuery(date, user, request);
    
    
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
};
