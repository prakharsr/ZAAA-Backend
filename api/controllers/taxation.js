var config = require('../../config');
var RateCard = require('../models/Ratecard');
var userController = require('./userController');
var firmController = require('./firmController');
var pdf = require('./pdf');
var User = require('../models/User');
var ReleaseOrder = require('../models/ReleaseOrder');
var jwt = require('jsonwebtoken');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var MediaHouse = require('../models/MediaHouse');
var Executive = require('../models/Executive');
var Invoice = require('../models/Invoice');
var Client = require('../models/Client');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;


function searchExecutiveID(request, response, user){
    return new Promise((resolve, reject) => {
        Executive.find({$and: [
            {'ExecutiveName':request.body.executiveName},
            {'OrganizationName':request.body.executiveOrg}
        ]}).exec(function(err, executive){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (executive.length===0)
            {
                    resolve(null);
            
            }
            if(executive.length!==0){
                executiveID =  executive[0]._id;
                resolve(executiveID);
            }
        })
    })
}

function searchClientID(request, response, user){
    return new Promise((resolve, reject) => {
        Client.find(
            {$and: [
                {$or:[
                    {firm:mongoose.mongo.ObjectId(user.firm)},
                    {global:true}
                ]},
                {'OrganizationName': request.body.clientName},
                {'Address.state': request.body.clientState}
            ]}
        ).exec(function(err, client){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (client.length===0)
            {
                
                resolve(null);
            
            }
            if(client.length!==0){
                clientID =  client[0]._id;
                resolve(clientID);
            }
        });
    });
}
function searchMediahouseID(request, response, user){
    return new Promise((resolve, reject) => {
        MediaHouse.find({$and: [
            {'PublicationName':request.body.publicationName},
            {"Address.edition":request.body.publicationEdition},
            {$or:[{'firm':mongoose.mongo.ObjectId(user.firm)},{global:true}]}
        ]}).exec( function(err, mediahouse){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (mediahouse.length == 0)
            {
                resolve(null)
            }
            if(mediahouse.length!==0){
                console.log("mediahouse found");
                mediahouseID =  mediahouse[0]._id;
                resolve(mediahouseID)
            }
        });
    })
}

function formQuery(mediahouseID, clientID, executiveID, date, user, request){
    return new Promise((resolve, reject) => {
        var query = {'firm':user.firm};
    if(mediahouseID)
    query['mediahouseID']=mongoose.mongo.ObjectId(mediahouseID);
    if(clientID)
    query['clientID'] = mongoose.mongo.ObjectId(clientID);
    if(executiveID)
    query['executiveID']=mongoose.mongo.ObjectId(executiveID);
    
    if(request.body.period)
    {
        var period = request.body.period;
        console.log(period)
        var to = new Date( period.year, period.month-1, period.day)
        var from = new Date( period.year, period.month-1, 1);
        console.log(to, from)
        query['date']={$gte: from, $lte:to} 
    }

    
    resolve(query);
        
    })
    
    
}

module.exports.queryInvoiceTax = async function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
                    var mediahouseID =await searchMediahouseID(request, response, user);
                    var clientID = await searchClientID(request, response, user);
                    var executiveID = await searchExecutiveID(request, response, user);
                    var date = (request.body.date)?(request.body.date):null;
                    
                    var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request);

                    
                    Invoice
                    .aggregate([ 
                    {$match:query },
                    {$project: { 
                        "clientName":1,
                        "invoiceNO":1,
                        "date":1,
                        "clientGSTIN.GSTType":1,
                        "clientGSTIN.GSTNo":1,
                        "taxAmount.primary":1,
                        "taxAmount.secondary":1,
                        "taxType":1,
                        "FinalTaxAmount":1,
                    }
                    },
                    {$limit: perPage},
                    {$skip:(perPage * request.body.page) - perPage}
                ]).exec(function(err, invoice){
                        if(err){
                            console.log(err+ "");
                            response.send({
                                success:false,
                                msg: err +""
                            });
                        }
                        else{
                            Invoice.count(query, function(err, count){
                                response.send({
                                    success:true,
                                    invoice: invoice,
                                    page: request.body.page,
                                    perPage:perPage,
                                    pageCount: Math.ceil(count/perPage)
                                });
                            })
                            
                        }
                    });
                }	
	});

};

module.exports.generateTaxSheet = async function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
                    var mediahouseID =await searchMediahouseID(request, response, user);
                    var clientID = await searchClientID(request, response, user);
                    var executiveID = await searchExecutiveID(request, response, user);
                    var date = (request.body.date)?(request.body.date):null;
                    
                    var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request);

                    
                    Invoice
                    .aggregate([ 
                    {$match:query },
                    {$project: { 
                        "clientName":1,
                        "invoiceNO":1,
                        "date":1,
                        "clientGSTIN.GSTType":1,
                        "clientGSTIN.GSTNo":1,
                        "taxAmount.primary":1,
                        "taxAmount.secondary":1,
                        "taxType":1,
                        "FinalTaxAmount":1,
                    }
                    },
                    {$limit: perPage},
                    {$skip:(perPage * request.body.page) - perPage}
                ]).exec(function(err, invoice){
                        if(err){
                            console.log(err+ "");
                            response.send({
                                success:false,
                                msg: err +""
                            });
                        }
                        else{
                            invoice.map(function(invoice){
                                return {                                
                                    "Invoice No": invoice.invoiceNO,
                                    "Client Name": invoice.clientName,
                                    "Date": invoice.date,
                                    "SGST %":(invoice.taxType == 'SGST + CGST')?((invoice.taxAmount.primary + invoice.taxAmount.secondary)/2):"-",
                                    "CGST %":(invoice.taxType == 'SGST + CGST')?(invoice.taxAmount.primary + invoice.taxAmount.secondary):"-",
                                    "IGST %":(invoice.taxType == 'IGST')?(invoice.taxAmount.primary + invoice.taxAmount.secondary):"-",
                                    "Total Tax": invoice.FinalTaxAmount,
                                    "Client GSTIN": invoice.clientGSTIN?invoice.clientGSTIN:"-",
                            }})
                            console.log(invoice)
                            createSheet(invoice, request, response);
                        }
                    });
                }	
	});

};

async function createSheet(data, request, response){
    console.log(data)
    response.send({
        success:true,
        data: data
    })


}