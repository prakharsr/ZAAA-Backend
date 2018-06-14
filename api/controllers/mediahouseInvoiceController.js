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
var MediaHouseInvoice = require('../models/MediaHouseInvoice');
var Executive = require('../models/Executive');
var Client = require('../models/Client');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;

module.exports.createMHInvoice = async (request,response) => {
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
            var releaseorder = await ReleaseOrder.findById(request.body.releaseOrderId);
            var firm = await Firm.findById(user.firm)
            
            var mhinvoice = new MediaHouseInvoice({
                releaseOrderId: releaseorder._id,
                publicationName:releaseorder.publicationName,
                publicationEdition:releaseorder.publicationEdition,
                mediaType:releaseorder.mediaType,
                publicationState:releaseorder.publicationState,
                publicationGSTIN:releaseorder.publicationGSTIN,
                insertions: request.body.insertions,
                releaseOrderNo: releaseorder.releaseOrderNo,
                MHIDate: request.body.MHIDate,
                MHIGrossAmount: request.body.MHIGrossAmount,
                MHITaxAmount: request.body.MHITaxAmount,
                mediahouseID: mediahouseID,
                executiveID: executiveID,
                clientID: clientID,
                firm: firm._id
            })
            
            mhinvoice.save((err,doc)=>{
                if(err){
                    response.send({
                        success: false,
                        msg: 'media house invoice cannot be created' + err
                    })
                }
                else{
                    response.send({
                        success:true,
                        msg: 'Successfully created the MHInvoice'
                    })
                    
                }
            })
        }	
	});
}


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

function formQuery(mediahouseID, date, user, request){
    return new Promise((resolve, reject) => {
        var query = {'firm':user.firm};
        console.log(query)
        console.log(mediahouseID, date, user)
        if(mediahouseID)
        query['mediahouseID']=mongoose.mongo.ObjectId(mediahouseID);
        if(request.body.releaseOrderNo){
            query['releaseOrderNo']=request.body.releaseOrderNo
        }
        
        if(request.body.insertionPeriod){
            to = new Date();
            from =  new Date(to.getTime() - (request.body.insertionPeriod)*24*60*60*1000);
            query['insertions.insertionDate'] = {$lte:to, $gte:from}
        }
        else{
            to = new Date()
            from = new Date(1);
            query['insertions.insertionDate'] = {$lte:to, $gte:from}
        }
        console.log(to, from);
        console.log(query)
        resolve(query);
        
    })
    
    
}

module.exports.queryMediaHouseInvoices = function(request, response){
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
            var date = (request.body.date)?(request.body.date):null;
            var query = await formQuery(mediahouseID, date, user, request);
            
            
            MediaHouseInvoice
            .aggregate([
                {$unwind: "$insertions"}, 
                {$match:query},
                { $group : { 
                    _id: "$releaseOrderId",
                    count: {$sum: 1},
                    entries: { $push:  
                        {
                        "_id":"$_id",
                        "releaseOrderId":"$releaseOrderId",
                        "publicationName":"$publicationName",
                         "publicationEdition":"$publicationEdition",
                         "date": "$date", 
                        "insertions":{
                            "insertionDate": "$insertions.insertionDate", 
                            "Amount":"$insertions.Amount",
                            "insertionId": "$insertions.insertionId",
                            "collectedAmount":"$insertions.collectedAmount",
                            "_id": "$insertions._id",
                         },
                         "releaseOrderNo":"$releaseOrderNo",
                         "MHINo":"$MHINo",
                         "MHIDate":"$MHIDate",
                         "MHIGrossAmount":"$MHIGrossAmount",
                         "MHITaxAmount":"$MHIAmount"
                    } }
                } },
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
                    console.log(insertions)
                    MediaHouseInvoice.count(query, function(err, count){
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
};

module.exports.queryMediaHouseInvoices = function(request, response){
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
            var date = (request.body.date)?(request.body.date):null;
            var query = await formQuery(mediahouseID, date, user, request);
            
            
            MediaHouseInvoice
            .find(query)
            .limit(perPage)
            .skip((perPage * request.body.page) - perPage)
            .exec(function(err, mediahouseInvoice){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    MediaHouseInvoice.count(query, function(err, count){
                        response.send({
                            success:true,
                            mediahouseInvoice: mediahouseInvoice,
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


module.exports.generateSummarySheet = function(request, response){
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
		else {
            try {
                var mhis = request.body.mhis; // { ...insertion, amount: number }[]

                MediaHouseInvoice.find({ firm: user.firm }).then(invoice => {
                    invoice.insertions.forEach(mhiInsertion => {
                        mhis.forEach(insertion => {
                            if (mhiInsertion.insertionId == insertion._id) {
                                mhiInsertion.collectedAmount = insertion.amount;
                            }
                        });
                    });

                    invoice.save(function(err) {
                        if (err) {
                            response.send({
                                success: false,
                                msg: "error" + err
                            });
                        }
                    });
                });
            }
            catch (err) {
                if (err)
                    console.log(err)
            }

            response.send({
                success:true,
                msg:"done"
            })
        }	
	});
};
