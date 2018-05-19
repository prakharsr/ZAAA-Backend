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
var Receipt = require('../models/Receipt');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;


function getExecutiveID(request, response, user){
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
                var newExecutive = new Executive({
                    OrganizationName:request.body.executiveOrg,
                    ExecutiveName:request.body.executiveName,
                    firm : user.firm
                });
                newExecutive.save(function(err, doc){
                    executiveID = newExecutive._id;
                    resolve(executiveID);
                })
            }
            if(executive.length!==0){
                executiveID =  executive[0]._id;
                resolve(executiveID);
            }
        })
    })
}

function getClientID(request, response, user){
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
                var newClient = new Client({
                    OrganizationName:request.body.clientName,
                    firm : user.firm
                });
                newClient.save(function(err, doc){
                    clientID = newClient._id;
                    resolve(clientID);
                })
            }
            if(client.length!==0){
                clientID =  client[0]._id;
                resolve(clientID);
            }
        });
    });
}
function getMediahouseID(request, response, user){
    return new Promise((resolve, reject) => {
        MediaHouse.find({$and: [
            {"Address.edition":request.body.publicationEdition},
            {PublicationName:request.body.publicationName},
            {$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}
        ]}).exec( function(err, mediahouse){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (mediahouse.length == 0)
            {
                console.log('no mediahouse found');
                console.log(request.body)
                var newMediahouse = new MediaHouse({
                    OrganizationName:request.body.organizationName,
                    PublicationName:request.body.publicationName,
                    'Address.edition':request.body.publicationEdition,
                    MediaType:request.body.mediaType,
                    'Address.state':request.body.publicationState,
                    GSTIN:request.body.publicationGSTIN,
                    global:false,
                    GSTIN:request.body.GSTIN,
                    firm : user.firm
                });
                
                newMediahouse.save(function(err, doc){
                    console.log('mediahouse saved');
                    mediahouseID = newMediahouse._id;
                    resolve(mediahouseID)
                })
            }
            if(mediahouse.length!==0){
                console.log("mediahouse found");
                mediahouseID =  mediahouse[0]._id;
                resolve(mediahouseID)
            }
        });
    })
}


function findInvoice(request, response, user){
    return new Promise((resolve, reject)=>{
        Invoice.findOne({
            $and:[
                {firm:user.firm},
                {"_id":mongoose.mongo.ObjectID(request.body.invoiceID)},
            ]
        }).exec( function(err, invoice){
            if(err){
                console.log(err)
                reject(err)
            }
            else{
                console.log(invoice);
                resolve(invoice);
            }
        });
    });
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
        MediaHouse.findById(mongoose.mongo.ObjectId(id),async function(err, mediahouse){
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
        var invoice = await findInvoice(request, response, user);
        var firm = await findFirm(mongoose.mongo.ObjectId(user.firm));
        var mediahouse = await findMediahouse(invoice.mediahouseID);
        var client = await findClient(invoice.clientID);
        var executive = await findExecutive(invoice.executiveID);
    }
    catch(err){
        console.log(err);
    }
    var receipt = new Receipt({
        advanced: false,
        paymentType:request.body.paymentType,
        paymentDate:request.body.paymentDate,
        paymentNo:request.body.paymentNo,
        paymentAmount:request.body.paymentAmount,
        paymentBankName:request.body.paymentBankName,
        paymentAmountWords:request.body.paymentAmountWords,
        
        invoiceID :request.body.invoiceID,
        ReceiptNO: '20',
        agencyName: firm.FirmName,
        agencyGSTIN: firm.GSTIN,
        agencyPerson: user.name,
        signature: user.signature,
        clientName:client.OrganizationName,
        clientGSTIN:client.GSTIN,
        clientState:client.Address.state,
        publicationName:mediahouse.PublicationName,
        publicationEdition:mediahouse.Address.edition,
        mediaType:mediahouse.MediaType,
        publicationState:mediahouse.Address.state,
        publicationGSTIN:mediahouse.GSTIN,
        
        adGrossAmount:invoice.adGrossAmount,
        publicationDiscount:invoice.publicationDiscount,
        agencyDiscount1:invoice.agencyDiscount1,
        taxAmount:invoice.taxAmount,
        taxIncluded:invoice.taxIncluded,
        otherCharges:invoice.otherCharges,
        extraCharges:invoice.extraCharges,
        
        caption:invoice.caption,
        remark:invoice.remark,
        otherRemark:invoice.otherRemark,
        executiveName:executive.ExecutiveName,
        executiveOrg:executive.OrganizationName,
        exceedingAmount:0,
        
        template: firm.ROTemplate,
        firm:user.firm,
        mediahouseID : invoice.mediahouseID,
        clientID: invoice.clientID,
        executiveID: invoice.executiveID,  
    })
    
    
        receipt.save(function(err, doc){
            if(err){
                console.log(err);
                response.send({
                    success:false,
                    msg: "Error! in saving Receipt" + err
                })
            }
            else{
                Invoice.update({ $and: [{firm:user.firm}, {"_id":doc.invoiceID}]},
                { $set: { "clearedAmount": invoice.clearedAmount+request.body.paymentAmount,
                "pendingAmount": invoice.pendingAmount-request.body.paymentAmount
            }}).exec(err,function(){
                if(err){
                    response.send({
                        success:false,
                        msg:"Error in updating invoice details"
                    });
                }
                else{
                    response.send({
                        success:true,
                        msg:"Receipt saved.",
                        receipt: receipt
                    });
                }
            });
        }
    });
}

module.exports.createReceipt = function(request, response){
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

module.exports.createAdvancedReciept = function(request,response){
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token,request,response, async function(err, user){
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
		else {
            var firm = await Firm.findById(user.firm);
            var client = await getClientID(request,response,user);
            var executive = await getExecutiveID(request,response,user);
            var mediahouse = await getMediahouseID(request,response,user);
            
            var receipt = new Receipt({
                advanced: true,
                paymentType:request.body.paymentType,
                paymentDate:request.body.paymentDate,
                paymentNo:request.body.paymentNo,
                paymentAmount:request.body.paymentAmount,
                paymentBankName:request.body.paymentBankName,
                paymentAmountWords:request.body.paymentAmountWords,
                
                ReceiptNO: '20',
                agencyName: firm.FirmName,
                agencyGSTIN: firm.GSTIN,
                agencyPerson: user.name,
                signature: user.signature,
                clientName:client.OrganizationName,
                clientGSTIN:client.GSTIN,
                clientState:client.Address.state,
                publicationName:mediahouse.PublicationName,
                publicationEdition:mediahouse.Address.edition,
                mediaType:mediahouse.MediaType,
                publicationState:mediahouse.Address.state,
                publicationGSTIN:mediahouse.GSTIN,
                executiveName:executive.ExecutiveName,
                executiveOrg:executive.OrganizationName,
                exceedingAmount: 0,
                
                template: firm.ROTemplate,
                firm:user.firm,
                mediahouseID : invoice.mediahouseID,
                clientID: invoice.clientID,
                executiveID: invoice.executiveID
            });
            receipt.save((err,doc) => {
                if(err){
                    response.send({
                        success:false,
                        msg:'Cannot save receipt data'
                    })
                }
                else{
                    response.send({
                        success:true,
                        msg:'saved receipt data'
                    })
                }
            })
        }
    });  
}

module.exports.linkRecieptToInvoice = function(request,response){
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
            var receipt = await Reciept.findById(request.body.receiptID);
            var invoice = await Invoice.findById(request.body.invoiceID);
            
            receipt.invoiceID = request.body.invoiceID;
            receipt.save((err,doc) => {
                if(err){
                    console.log(err);
                    response.send({
                        success:false,
                        msg: "Error! in saving Receipt" + err
                    })
                }
                else{
                    if(receipt.paymentAmount > invoice.pendingAmount){
                        Invoice.update({ $and: [{firm:user.firm}, {"_id":doc.invoiceID}]},
                            { $set: { "clearedAmount": invoice.clearedAmount+invoice.pendingAmount,
                                    "pendingAmount": 0,
                                    "exceedingAmount":receipt.paymentAmount - invoice.pendingAmount
                                    }}).exec(err,function(){
                                if(err){
                                response.send({
                                    success:false,
                                    msg:"Error in updating invoice details"
                                });
                                }
                                else{
                                    response.send({
                                        success:true,
                                        msg:"Receipt saved.",
                                        receipt: receipt
                                    });
                                }
                            });
                    }
                    else{
                        Invoice.update({ $and: [{firm:user.firm}, {"_id":doc.invoiceID}]},
                            { $set: { "clearedAmount": invoice.clearedAmount+request.body.paymentAmount,
                                    "pendingAmount": invoice.pendingAmount-request.body.paymentAmount
                                    }}).exec(err,function(){
                                if(err){
                                response.send({
                                    success:false,
                                    msg:"Error in updating invoice details"
                                });
                                }
                                else{
                                    response.send({
                                        success:true,
                                        msg:"Receipt saved.",
                                        receipt: receipt
                                    });
                                }
                            });
                        }
                    }
        });
    }
});
}

module.exports.getReceipt = function(request,response){
    
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
            Receipt.findById(request.params.id,async function(err, receipt){
                if(err){
                    console.log("here" +err);
                    response.send({
                        success:false,
                        msg: err+"",
                    });
                }
                else{
                    try{
                        var mediahouse = await findMediahouse(receipt.mediahouseID);
                        var executive = await findExecutive(receipt.executiveID);
                        var client = await findClient(receipt.clientID);
                        var invoice = await Invoice.findById(receipt.invoiceID);
                        response.send({
                            mediahouse: mediahouse,
                            client: client,
                            executive: executive,
                            success : true,
                            invoice : invoice,
                            receipt : receipt
                        }); 
                    }
                    catch(err){
                        response.send({
                            success: false,
                            msg: "Can't fetch Receipt" + err
                        });
                    }
                }
            });
			
		}
	});	
};

module.exports.getReceipts = function(request, response){
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
            Receipt.find({firm:user.firm})
            .limit(perPage)
            .skip((perPage*request.params.page) - perPage)
            .sort(-'date')
            .exec(function(err, receipt){
                if(err){
                    console.log("here");
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else if(!receipt){
                    console.log("No receipt");
                    response.send({
                        success:false,
                        msg:" No Receipt"
                    });
                }
                else{
                    Receipt.count({}, function(err, count){
                        response.send({
                            success : true,
                            receipt : receipt,
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
        resolve(query);
        
    })
    
    
}

module.exports.queryReceipt = async function(request, response){
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
            var adCategory1 = request.body.adCategory1;
            var adCategory2 = request.body.adCategory2;
            
            var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request);
            console.log(request.body)
            console.log(query)
            console.log(request.body)
            
            Receipt.find(query)
            .limit(perPage)
            .skip((perPage * request.body.page) - perPage)
            .exec(function(err, receipt){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    Receipt.count(query, function(err, count){
                        response.send({
                            success:true,
                            receipt: receipt,
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

module.exports.deleteReceipt = function(request, response){
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
            var receipt = await Receipt.findById(request.params.id);
            var invoice = await Invoice.findById(receipt.invoiceID);
            Invoice.update(
                { $and: [{firm:user.firm}, { _id : receipt.invoiceID }]
            },
            { $set: {"clearedAmount": invoice.clearedAmount-receipt.netAmountFigures,
            "pendingAmount": invoice.pendingAmount+receipt.netAmountFigures }}
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
                Receipt.findByIdAndRemove(request.params.id,function(err){
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
                            msg: "Receipt deleted"
                        });
                    }
                    
                })
            }
        })
    }	
});
};

module.exports.updateReceipt = function(request, response){
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
            Receipt.findByIdAndUpdate(request.params.id,{$set:request.body},function(err, receipt){
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
                        msg: "receipt Updated"
                    });
                }
                
            })
		}	
	});
};


module.exports.mailROPdf = function(request, response) {
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
            ReleaseOrder.findById(request.body.id, async function(err, releaseOrder){
                if(err){
                    console.log(err);
                    response.send({
                        success :false,
                        msg: err 
                    });
                }
                else if(!releaseOrder){
                    response.send({
                        success :false,
                        msg: 'Release order not found' 
                    });
                }
                else{
                    var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
                    releaseOrder.generated=true;
                    releaseOrder.save(function(err){
                        if(err)
                        response.send({
                            success:false,
                            msg: err
                        });
                        else{
                            var insData="";
                            var insertions = releaseOrder.insertions;
                            var size = releaseOrder.adSizeL * releaseOrder.adSizeW;
                            var damount = (releaseOrder.publicationDiscount+releaseOrder.agencyDiscount1+releaseOrder.agencyDiscount2)*releaseOrder.adGrossAmount/10000;
                            var namount = releaseOrder.netAmountFigures;
                            insertions.forEach(object =>{
                                insData+='<tr><td>'+releaseOrder.publicationName+'</td><td>'+releaseOrder.publicationEdition+'</td><td>'+object.date.day+'-'+object.date.month+'-'+object.date.year+'</td><td>'+releaseOrder.adPosition+'</td><td>'+releaseOrder.adSizeL+'x'+releaseOrder.adSizeW+'</td><td>'+size+'</td><td>'+releaseOrder.rate+'</td></tr>';
                            });
                            var Details = {
                                image : 'http://www.mom2k18.co.in/'+firm.LogoURL,
                                mediahouse :releaseOrder.publicationName,
                                pgstin :releaseOrder.publicationGSTIN.GSTNo,
                                cname :releaseOrder.clientName,
                                cgstin :releaseOrder.clientGSTIN.GSTNo,
                                gstin :releaseOrder.agencyGSTIN,
                                scheme :releaseOrder.adSchemePaid+'-'+releaseOrder.adSchemeFree,
                                gamount :releaseOrder.adGrossAmount,
                                insertions :insData,
                                dper :releaseOrder.publicationDiscount+'+'+releaseOrder.agencyDiscount1+'+'+releaseOrder.agencyDiscount2,
                                damount :damount,
                                namount :namount,
                                logo: firm.LogoURL,
                                email: user.email
                            }
                            pdf.mailReleaseOrder(request,response,Details);
                        }
                    })
                    
                }
            })
        }
    });
}

module.exports.generateROPdf = function(request, response) {
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
            ReleaseOrder.findById(request.body.id, async function(err, releaseOrder){
                if(err){
                    console.log(err);
                    response.send({
                        success :false,
                        msg: err 
                    });
                }
                else if(!releaseOrder){
                    response.send({
                        success :false,
                        msg: 'Release order not found' 
                    });
                }
                else{
                    var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
                    releaseOrder.generated=true;
                    releaseOrder.save(function(err){
                        if(err)
                        response.send({
                            success:false,
                            msg: err
                        });
                        else{
                            var insData="";
                            var insertions = releaseOrder.insertions;
                            var size = releaseOrder.adSizeL * releaseOrder.adSizeW;
                            var damount = (releaseOrder.publicationDiscount+releaseOrder.agencyDiscount1+releaseOrder.agencyDiscount2)*releaseOrder.adGrossAmount;
                            var namount = releaseOrder.adGrossAmount - damount ;
                            insertions.forEach(object =>{
                                insData+='<tr><td>'+releaseOrder.publicationName+'</td><td>'+releaseOrder.publicationEdition+'</td><td>'+object.date.day+'-'+object.date.month+'-'+object.date.year+'</td><td>'+releaseOrder.adPosition+'</td><td>'+releaseOrder.adSizeL+'x'+releaseOrder.adSizeW+'</td><td>'+releaseOrder.size+'</td><td>'+releaseOrder.rate+'</td></tr>';
                            });
                            var Details = {
                                image : 'http://www.mom2k18.co.in/'+firm.LogoURL,
                                mediahouse :releaseOrder.publicationName,
                                pgstin :releaseOrder.publicationGSTIN.GSTNo,
                                cname :releaseOrder.clientName,
                                cgstin :releaseOrder.clientGSTIN.GSTNo,
                                gstin :releaseOrder.agencyGSTIN,
                                scheme :releaseOrder.adSchemePaid+'-'+releaseOrder.adSchemeFree,
                                gamount :releaseOrder.adGrossAmount,
                                insertions :insData,
                                dper :releaseOrder.publicationDiscount+'+'+releaseOrder.agencyDiscount1+'+'+releaseOrder.agencyDiscount2,
                                damount :damount,
                                namount :namount,
                                logo: firm.LogoURL
                            }
                            pdf.generateReleaseOrder(request,response,Details);
                        }
                    })
                    
                }
            })
        }
    });
}
