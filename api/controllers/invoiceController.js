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


function findReleaseOrderInsertions(request, response, user){
return new Promise((resolve, reject)=>{
    ReleaseOrder.find({
        firm:user.firm,
        "_id":request.body.releaseOrderId,
        "insertion._id":{$in:request.body.ids}
    }, function(err, releaseOrder){
        if(err){
            console.log(err)
            reject(err)
        }
        else if(releaseOrders.length == 0){
            resolve(null);
        }
        else{
            resolve(releaseOrders);
        }
    })
})
}

function findExecutive(id){
    return new Promise((resolve, reject => {
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
    }))
}
function findClient(id){
    return new Promise((resolve, reject => {
        MediaHouse.findById(mongoose.mongo.ObjectID(id), function(err, client){
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
    }))
}
function findMediahouse(id){
    return new Promise((resolve, reject => {
        MediaHouse.findById(mongoose.mongo.ObjectID(id), function(err, mediahouse){
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
    }))
}
async function f(request, response, user){
    var releaseOrder = await findReleaseOrderInsertions(request, response, user);
    var firm = await Firm.findById(mongoose.mongo.ObjectId(user.firm));
    var mediahouse = await findMediahouse(request.body.mediahouseID);
    var client = await findClient(request.body.clientID);
    var executive = await findExecutive(request.body.executiveID);

    var invoice = new Invoice({
                
        releaseOrderNO: '20',
        agencyName: firm.FirmName,
        agencyGSTIN: firm.GSTIN,
        agencyPerson: user.name,
        signature: user.signature,
        clientName:request.body.clientName,
        clientGSTIN:request.body.clientGSTIN,
        clientState:request.body.clientState,
        publicationName:request.body.publicationName,
        publicationEdition:request.body.publicationEdition,
        mediaType:request.body.mediaType,
        publicationState:request.body.publicationState,
        publicationGSTIN:request.body.publicationGSTIN,
        
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

        caption:request.body.caption,
        remark:request.body.remark,
        insertions: request.body.insertions,
        executiveName:request.body.executiveName,
        executiveOrg:request.body.executiveOrg,
        otherRemark:request.body.otherRemark,
        template: firm.ROTemplate,
        firm:user.firm,
        mediahouseID : mediahouseID,
        clientID: clientID,
        executiveID: executiveID,

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
            Client.update({ $and: [{firm:user.firm}, {"_id":doc.clientID}]
        },
        { $set: { "GSTIN": doc.clientGSTIN }}).exec(err,function(){
            if(err){
                response.send({
                    success:false,
                    msg:"Error in updating client GST number"
                })
            }
        })


        response.send({
            success:true,
            msg:"Invoice saved.",
            invoice:doc 
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
                        var mediahouse = await MediaHouse.findMediahouse(invoice.mediahouseID);
                        var executive = await Executive.findExecutive(invoice.executiveID);
                        var client = await Client.findClient(invoice.clientID);
                        var releaseOrder = await findReleaseOrderInsertions(request, response, user);
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
                            msg: "Can't fetch Invoice"
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
module.exports.setInsertionChecks = function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
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
            ReleaseOrder.updateMany(
                { $and: [{firm:user.firm}, {"insertions._id":{$in:request.body.ids}}]
                },
                { $set: { "insertions.$.state": request.body.state }}
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
                    response.send({
                        success:true,
                        msg: "ReleaseOrder Insertions Updated"
                    });
                }
                
            })
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
                    var adCategory1 = request.body.adCategory1;
                    var adCategory2 = request.body.adCategory2;
                    
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
                                console.log(releaseOrders, count)
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

module.exports.queryInsertions = function(request, response){
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
                    if(request.body.insertionPeriod){
                        var to = new Date()
                        var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.insertionPeriod);
                    }
                    else{
                        var to = new Date()
                        var from = new Date(1);
                    }
                    var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request);

                    
                    Invoice
                    .aggregate([{$unwind: "$insertions"}, 
                    {$match:query },
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
                    {$skip:(perPage * request.body.page) - perPage}
                    ])
                    .exec(function(err, insertions){
                                if(err){
                                    console.log(err+ "");
                                    response.send({
                                        success:false,
                                        msg: err +""
                                    });
                                }
                                else{
                                    Invoice.count(query, function(err, count){
                                        console.log(insertions, count)
                                        response.send({
                                            success:true,
                                            insertions: insertions,
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
