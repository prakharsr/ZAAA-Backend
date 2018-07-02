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


function findReleaseOrder(request, response, user){
return new Promise((resolve, reject)=>{
    console.log(request.body)
    ReleaseOrder.findOne({
        $and:[
            {firm:user.firm},
            {"_id":mongoose.mongo.ObjectID(request.body.releaseOrderId)},
            {"insertions._id":{$in:request.body.insertions.map(insertion => insertion._id)}}
        ]
    
    }).exec( function(err, releaseOrder){
        if(err){
            console.log(err)
            reject(err)
        }
        else{
            console.log(releaseOrder);
            resolve(releaseOrder);
        }
    })
})
}

function findExecutive(id){
    return new Promise((resolve, reject) => {
        Executive.findById(mongoose.mongo.ObjectID(id), function(err, executive){
            if(err){
                console.log(err)
                reject(err)
            }
            else if(!executive)
            {
                resolve(null);
            }
            else{
                resolve(executive);
            }
        })
    })
}
function findClient(id){
    return new Promise((resolve, reject) => {
        Client.findById(mongoose.mongo.ObjectID(id), function(err, client){
            if(err){
                console.log(err)
                reject(err)
            }
            else if(!client)
            {
                resolve(null);
            }
            else{
                resolve(client);
            }
        })
    })
}
function findFirm(id){
    return new Promise((resolve, reject) => {
        Firm.findById(mongoose.mongo.ObjectID(id), function(err, firm){
            if(err){
                console.log(err)
                reject(err)
            }
            else if(!firm)
            {
                resolve(null);
            }
            else{
                resolve(firm);
            }
        })
    })
}
function findMediahouse(id){
    return new Promise((resolve, reject) => {
        console.log(id)
        MediaHouse.findById(mongoose.mongo.ObjectId(id), function(err, mediahouse){
            if(err){
                console.log(err)
                reject(err)
            }
            else if(!mediahouse)
            {
                resolve(null);
            }
            else{
                resolve(mediahouse);
            }
        })
    })
}
async function f(request, response, user){
    try {
        var releaseOrder = await findReleaseOrder(request, response, user)
        var firm = await findFirm(mongoose.mongo.ObjectId(user.firm));
        var mediahouse = await findMediahouse(releaseOrder.mediahouseID);
        var client = await findClient(releaseOrder.clientID);
        var executive = await findExecutive(releaseOrder.executiveID);
        var counter = releaseOrder.invoiceSerial+1;
        var ino = releaseOrder.releaseOrderNO+'.'+counter

    }
    catch(err){
        console.log(err);
    }

    var invoice = new Invoice({
        releaseOrderId :request.body.releaseOrderId,
        invoiceNO: ino,
        agencyName: firm.FirmName,
        agencyGSTIN: firm.GSTIN,
        agencyPerson: user.name,
        agencyState:firm.OfficeAddress.state,
        signature: user.signature,
        clientName:client.OrganizationName,
        clientGSTIN:request.body.GSTIN,
        clientState:client.Address.state,
        publicationName:mediahouse.PublicationName,
        publicationEdition:mediahouse.Address.edition,
        mediaType:mediahouse.MediaType,
        publicationState:mediahouse.Address.state,
        publicationGSTIN:mediahouse.GSTIN,
        
        adGrossAmount:request.body.adGrossAmount,
        publicationDiscount:request.body.publicationDiscount,
        agencyDiscount1:request.body.agencyDiscount1,
        agencyDiscount2:request.body.agencyDiscount2,
        taxAmount:request.body.taxAmount,
        taxIncluded:request.body.taxIncluded,
        netAmountFigures:request.body.netAmountFigures,
        netAmountWords:request.body.netAmountWords,
        otherCharges:request.body.otherCharges,
        extraCharges:request.body.extraCharges,
        pendingAmount:request.body.pendingAmount,
        FinalTaxAmount:request.body.FinalTaxAmount,

        caption:request.body.caption,
        remark:request.body.remark,
        otherRemark:request.body.otherRemark,
        insertions: request.body.insertions,
        executiveName:executive.ExecutiveName,
        executiveOrg:executive.OrganizationName,

        template: firm.ROTemplate,
        firm:user.firm,
        mediahouseID : releaseOrder.mediahouseID,
        clientID: releaseOrder.clientID,
        executiveID: releaseOrder.executiveID,

    })

    invoice.save(function(err, doc){
        if(err){
            console.log(err);
            response.send({
                success:false,
                msg: "Error! in saving Invoice" + err
            })
        }
        else{
            Client.update({ $and: [{firm:user.firm}, {"_id":doc.clientID}] },
            { $set: { "GSTIN": doc.clientGSTIN }}).exec(err,function(){
                if(err){
                    response.send({
                        success:false,
                        msg:"Error in updating client GST number"
                    })
                }
            });

            releaseOrder.insertions
                .filter(insertion => invoice.insertions.some(ins => ins.date.day == insertion.date.day
                                                                && ins.date.month == insertion.date.month
                                                                && ins.date.year == insertion.date.year))
                .forEach(insertion => insertion.marked = true);


            releaseOrder.invoiceSerial += 1;
            releaseOrder.save((err,doc) => {
                if(err){
                    request.body.insertions.map(insertion => insertion._id)
                    response.send({
                        success:false,
                        msg: err + "" + request.body.insertions.map(insertion => insertion._id)
                    });
                }
                else{
                    console.log(mongoose.mongo.ObjectId(request.body.releaseOrderId), request.body.insertions.map(insertion => mongoose.mongo.ObjectId(insertion._id)))
                    response.send({
                        success:true,
                        msg:"Invoice saved.",
                        invoice:doc 
                    })
                }
            })
        }
    })
}

module.exports.createInvoice = function(request, response){
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err){
			console.log("error in finding user");
			response.send({
				success:false,
				msg:err+""
			});
        }
        else if(!user)
        {
            console.log("User not found");
            response.send({
                success:false,
                msg:" no user"
            });
            
        }
		else if(user){
            f(request, response, user)
            
            
        }
    });
};

module.exports.getInvoice = function(request,response){
    
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err+""
			});
		}
		else{
            
            Invoice.findById(request.params.id,async function(err, invoice){
                if(err){
                    console.log("here" +err);
                    response.send({
                        success:false,
                        msg: err+"",
                    });
                }
                else{
                    try{
                        var mediahouse = await findMediahouse(invoice.mediahouseID);
                        var executive = await findExecutive(invoice.executiveID);
                        var client = await findClient(invoice.clientID);
                        var releaseOrder = await ReleaseOrder.findById(invoice.releaseOrderId);
                        response.send({
                            mediahouse: mediahouse,
                            client: client,
                            executive: executive,
                            success : true,
                            releaseOrder: releaseOrder,
                            invoice : invoice
                        }); 
                    }
                    catch(err){
                        response.send({
                            success: false,
                            msg: "Can't fetch Invoice" + err
                        });
                    }
                }
            });
			
		}
	});	
};

module.exports.getInvoices = function(request, response){
    
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log(err);
			response.send({
				success:false,
				msg: err +""
			});
		}
		else{
            Invoice.find({firm:user.firm})
            .limit(perPage)
            .skip((perPage*request.params.page) - perPage)
            .sort(-'date')
            .exec(function(err, invoice){
                if(err){
                    console.log("here");
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else if(!invoice){
                    console.log("No releaseorder");
                    response.send({
                        success:false,
                        msg:" No release Order"
                    });
                }
                else{
                    Invoice.count({}, function(err, count){
                        response.send({
                            success : true,
                            invoice : invoice,
                            perPage:perPage,
                            page: request.params.page,
                            pageCount : Math.ceil(count/perPage)
                            
                        });
                    })
                }
            });
		}
	});	
    
};

module.exports.getInvoiceInsertions = function(request, response){
    
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log(err);
			response.send({
				success:false,
				msg: err +""
			});
		}
		else{
            Invoice
            .aggregate([{$unwind: "$insertions"}, 
                {$match:{firm:user.firm} },
                {$project: {
                    "_id":1,
                    "publicationName":1,
                    "publicationEdition":1, 
                    "clientName":1,
                    "insertions.date": 1, 
                    "insertions.marked": 1,
                    "insertions.state": 1,
                    "insertions.ISODate": 1, 
                    "insertions._id": 1,
                    "executiveName":1,
                    "executiveOrg":1,
                }
                },
                {$limit: perPage},
                {$skip:(perPage * request.params.page) - perPage}
            ])
            .exec(function(err, insertions){
                if(err){
                    console.log("here");
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else if(!insertions){
                    console.log("No insertions");
                    response.send({
                        success:false,
                        msg:" No inseryions"
                    });
                }
                else{
                    Invoice.count({}, function(err, count){    
                        response.send({
                            success : true,
                            insertions : insertions,
                            perPage:perPage,
                            page: request.params.page,
                            pageCount : Math.ceil(count/perPage)
                            
                        });
                    })
                }
            });
		}
	});	
};

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
    if(request.body.creationPeriod)
    {
            var to = new Date()
            var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.creationPeriod);
            query['date']={$gte: from, $lte:to} 
    }
    else{
        var to = new Date()
        var from = new Date(1);
        query['date']={$gte: from, $lte:to} 
    }
    if(request.body.insertionPeriod){
        var to = new Date()
        var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.insertionPeriod);
    }
    if(request.body.invoiceNO)
    query['invoiceNO'] = request.body.invoiceNO
    
    resolve(query);
        
    })
    
    
}

module.exports.queryInvoice = async function(request, response){
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
                    console.log(request.body)
                    console.log(query)
                    console.log(request.body)
                    
                    Invoice.find(query)
                    .limit(perPage)
                    .skip((perPage * request.body.page) - perPage)
                    .exec(function(err, invoice){
                        if(err){
                            console.log(err+ "");
                            response.send({
                                success:false,
                                msg: err +""
                            });
                        }
                        else{
                            Invoice.count(query, function(err, count){
                                console.log(invoice, count)
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

module.exports.queryClientPayments = function(request, response){
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

                    
                    Invoice.aggregate([ 
                    {$match:query},
                    { $group : { 
                        _id: "$clientID",
                        count: {$sum: 1},
                        
                        shadow :{$sum:{ $add: [ "$pendingAmount", "$collectedAmount" ] }},
                        balance :{$sum: "$collectedAmount" },
                        totalBalance:{$sum: "$pendingAmount" },
                        entries: { $push:  
                        {
                        "publicationName":"$publicationName",
                        "publicationEdition":"$publicationEdition", 
                        "clientName":"$clientName",
                        "invoiceNO":"$invoiceNO",
                        shadow :{ $add: [ "$pendingAmount", "$collectedAmount" ] },
                        "balance":"$collectedAmount",
                        "totalBalance":"$pendingAmount",
                        "executiveOrg":"$executiveOrg",
                        "executiveName": "$executiveName",
                    } }

                     } },
                    {$limit: perPage},
                    {$skip:(perPage * request.body.page) - perPage}
                    ])
                    .exec(function(err, invoices){
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
                                            invoices: invoices,
                                            page: request.body.page,
                                            perPage:perPage,
                                            pageCount: Math.ceil(count/perPage)
                                        });
                                    })
                                    
                                }
                            });
                        }	
	});
}
module.exports.queryExecutivePayments = function(request, response){
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

                    
                    Invoice.aggregate([ 
                    {$match:query},
                    { $group : { 
                        _id: "$executiveID",
                        count: {$sum: 1},
                        
                        shadow :{$sum:{ $add: [ "$pendingAmount", "$collectedAmount" ] }},
                        balance :{$sum: "$collectedAmount" },
                        totalBalance:{$sum: "$pendingAmount" },
                        entries: { $push:  
                        {
                        "publicationName":"$publicationName",
                        "publicationEdition":"$publicationEdition", 
                        "clientName":"$clientName",
                        "invoiceNO":"$invoiceNO",
                        shadow :{ $add: [ "$pendingAmount", "$collectedAmount" ] },
                        "balance":"$collectedAmount",
                        "totalBalance":"$pendingAmount",
                        "executiveOrg":"$executiveOrg",
                        "executiveName": "$executiveName",
                    } }

                     } },
                    {$limit: perPage},
                    {$skip:(perPage * request.body.page) - perPage}
                    ])
                    .exec(function(err, invoices){
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
                                            invoices: invoices,
                                            page: request.body.page,
                                            perPage:perPage,
                                            pageCount: Math.ceil(count/perPage)
                                        });
                                    })
                                    
                                }
                            });
                        }	
	});
}




module.exports.deleteInvoice = function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
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
            ReleaseOrder.updateMany(
                { $and: [{firm:user.firm}, {"insertions._id":{$in:request.body.ids}}]
                },
                { $set: { "insertions.$.marked": false }}
            )
            .exec(function(err){
                if(err){
                    console.log(err);
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else{

            Invoice.findByIdAndRemove(request.params.id,function(err){
                if(err){
                    console.log(err);
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else{
                    response.send({
                        success:true,
                        msg: "Invoice deleted"
                    });
                }
                
            })
        }
        })
		}	
    });
};

module.exports.updateInvoice = function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err + ""
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
            Invoice.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, invoice){
                if(err){
                    console.log(err);
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else{
                    response.send({
                        success:true,
                        msg: "invoice Updated"
                    });
                }
                
            })
		}	
	});
};


module.exports.mailInvoicePdf = function(request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token,request,response, function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err + ""
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "Please Login"
			});
        }
        else {
            Invoice.findById(request.body.id, async function(err, invoice){
                if(err){
                    console.log(err);
                    response.send({
                        success :false,
                        msg: err 
                    });
                }
                else if(!invoice){
                    response.send({
                        success :false,
                        msg: 'Invoice not found' 
                    });
                }
                else{
                    var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
                    var releaseorder = await ReleaseOrder.findById(invoice.releaseOrderId);
                    var client = await Client.findById(invoice.clientID);
                    var executive = await Client.findById(invoice.executiveID);
                    var mediahouse = await Client.findById(invoice.mediaHouseID);
                    var pan = client.PanNO;
                    var insertions = invoice.insertions;
                    var size = releaseorder.adSizeL * releaseorder.adSizeW;
                    var count = 0;
                    var insData="";
                    var total= size*releaseorder.rate;
                    var disc = (invoice.publicationDiscount.percentage) ? invoice.adGrossAmount*invoice.publicationDiscount.amount/100 : invoice.publicationDiscount.amount;
                    var echarges = (invoice.extraCharges.percentage) ? invoice.adGrossAmount*invoice.extraCharges.amount/100 : invoice.extraCharges.amount;
                    insertions.forEach(object =>{
                        insData+='<tr><td>'+(++count)+'</td><td>'+releaseorder.publicationName+'</td><td>'+releaseorder.publicationEdition+'</td><td>'+object.date.day+'-'+object.date.month+'-'+object.date.year+'</td><td>'+releaseorder.adPosition+'</td><td>'+releaseorder.adSizeW+'</td><td>'+releaseorder.adSizeL+'</td><td>'+size+'</td><td>'+releaseorder.rate+'</td><td>'+total+'</td></tr>';
                    });

                    var Details={
                        image: 'http://www.adagencymanager.com/'+firm.logoURL, 
                        clientname: client.OrganizationName,
                        address: client.Address.address,
                        state: client.Address.state,
                        pan: pan,
                        ino: 'dummy',
                        gstin:client.GSTIN.GSTNo,
                        insertions: insData,
                        tnc: '',
                        gamount: invoice.adGrossAmount,
                        disc: disc,
                        cgst:'',
                        igst:'',
                        sgst:'',
                        cgstper:'',
                        igstper:'',
                        sgstper:'',
                        echarges: echarges,
                        amtwords: invoice.netAmountWords,
                        amtfig:invoice.netAmountFigures
                    }
                    
                    pdf.mailPaymentInvoice(request,response,Details);
                }
            })
        }
    });
}

module.exports.generateInvoicePdf = function(request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token,request,response, function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err + ""
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "Please Login"
			});
        }
        else {
            Invoice.findById(request.body.id, async function(err, invoice){
                if(err){
                    console.log(err);
                    response.send({
                        success :false,
                        msg: err 
                    });
                }
                else if(!invoice){
                    response.send({
                        success :false,
                        msg: 'Invoice not found' 
                    });
                }
                else{
                    var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
                    var releaseorder = await ReleaseOrder.findById(invoice.releaseOrderId);
                    var client = await Client.findById(invoice.clientID);
                    var executive = await Client.findById(invoice.executiveID);
                    var mediahouse = await Client.findById(invoice.mediaHouseID);
                    var pan = client.PanNO;
                    var insertions = invoice.insertions;
                    var size = releaseorder.adSizeL * releaseorder.adSizeW;
                    var count = 0;
                    var insData="";
                    var total= size*releaseorder.rate;
                    var disc = (invoice.publicationDiscount.percentage) ? invoice.adGrossAmount*invoice.publicationDiscount.amount/100 : invoice.publicationDiscount.amount;
                    var echarges = (invoice.extraCharges.percentage) ? invoice.adGrossAmount*invoice.extraCharges.amount/100 : invoice.extraCharges.amount;
                    insertions.forEach(object =>{
                        insData+='<tr><td>'+(++count)+'</td><td>'+releaseorder.publicationName+'</td><td>'+releaseorder.publicationEdition+'</td><td>'+object.date.day+'-'+object.date.month+'-'+object.date.year+'</td><td>'+releaseorder.adPosition+'</td><td>'+releaseorder.adSizeW+'</td><td>'+releaseorder.adSizeL+'</td><td>'+size+'</td><td>'+releaseorder.rate+'</td><td>'+total+'</td></tr>';
                    });

                    var Details={
                        image: 'http://www.adagencymanager.com/'+firm.logoURL, 
                        clientname : client.OrganizationName,
                        address: client.Address.address,
                        state: client.Address.state,
                        pan: pan,
                        ino: 'dummy',
                        gstin:client.GSTIN.GSTNo,
                        insertions: insData,
                        tnc: '',
                        gamount: invoice.adGrossAmount,
                        disc: disc,
                        cgst:'',
                        igst:'',
                        sgst:'',
                        cgstper:'',
                        igstper:'',
                        sgstper:'',
                        echarges: echarges,
                        amtwords: invoice.netAmountWords,
                        amtfig:invoice.netAmountFigures
                    }
                    
                    pdf.generatePaymentInvoice(request,response,Details);
                }
            })
        }
    });
}