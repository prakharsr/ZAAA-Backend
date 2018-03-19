var config = require('../../config');
var RateCard = require('../models/Ratecard');
var userController = require('./userController');
var firmController = require('./firmController');
var User = require('../models/User');
var RO = require('../models/ReleaseOrder');
var jwt = require('jsonwebtoken');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');

module.exports.createRO = function(request, response){
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err+""
			});
		}
		else{
        
            var releaseOrder = new ReleaseOrder({
                date: request.body.date,
                realeaseOrderNO: request.body.realeaseOrderNO,
                agencyName: request.body.agencyName,
                agencyGSTIN: request.body.agencyGSTIN,
                agencyPerson: request.body.agencyPerson,
                signature: request.body.signature,
                publicationName:request.body.publicationName,
                publicationEdition:request.body.publicationEdition,
                publicationAddress:request.body.publicationAddress,
                publicationCity:request.body.publicationCity,
                publicationState:request.body.publicationState,
                publicationGSTIN:request.body.publicationGSTIN,
                adType:request.body.adType,
                adCategory1:request.body.adCategory1,
                adCategory2:request.body.adCategory2,
                adCategory2:request.body.adCategory3,
                adCategory2:request.body.adCategory4,
                adCategory2:request.body.adCategory5,
                adCategory2:request.body.adCategory6,
                adHue:request.body.adHue,
                adSize:request.body.adSize,
                adTotalSpace:request.body.adTotalSpace,
                adEdition:request.body.adEdition,
                adPosition:request.body.adPosition,
                adScheme:request.body.adScheme,
                adTotal:request.body.adTotal,
                insertionDate:request.body.insertionDate,
                adGrossAmount:request.body.adGrossAmount,
                publicationDiscount:request.body.publicationDiscount,
                agencyDiscount1:request.body.agencyDiscount1,
                agencyDiscount2:request.body.agencyDiscount2,
                taxAmount:request.body.taxAmount,
                netAmountFigures:request.body.netAmountFigures,
                netAmountWords:request.body.netAmountWords,
                caption:request.body.caption,
                remark:request.body.remark,
                paymentDetails:request.body.paymentDetails,
                executiveName:request.body.executiveName,
                otherCharges:request.body.otherCharges,
                clientPayment:request.body.clientPayment
            });
            releaseOrder.save(function(err){
                if(err){
                    console.log(err);
                    response.send({
                        success : false,
                        msg : "cannot save release order data"
                    });
                }
                else{
                    response.send({
                        success : true,
                        msg : "release order data saved"
                    });
                }
            });
            
		}
	});	
    
};

module.exports.getReleaseOrder = function(request,response){
     
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err+""
			});
		}
		else{
            
            ReleaseOrder.findById(request.params.id,function(err, releaseOrder){
                
                if(err){
                    console.log("here" +err);
                    response.send({
                        success:false,
                        msg: err+"",
                    });
                }
                else{
                    response.send({
                        success : true,
                        releaseOrder : releaseOrder
                    }); 
                }
            });
			
		}
	});	
    
};
module.exports.getReleaseOrders = function(request, response){
     
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err+""
			});
		}
		else{
            
            ReleaseOrder.find({firm:mongoose.mongo.ObjectId(user.firm)},function(err, releaseOrders){
                
                if(err){
                    console.log("here" +err);
                }
                else{
                    response.send({
                        success : true,
                        releaseOrders : releaseOrders,
                    });
                }
            });
			
		}
	});	

};


module.exports.queryReleaseOrder = function(request, response){
    
    ReleaseOrder.find().or([{ 'agencyName': { $regex: request.params.keyword+"", $options:"i" }}, { 'PublicationName': { $regex: request.params.keyword+"", $options:"i" }},{ 'executiveName': { $regex: request.params.keyword+"", $options:"i" }},{ 'clientName': { $regex: request.params.keyword+"", $options:"i" }}]).sort('publicationName', 1)
    .limit(5).exec(function(err, releaseOrders){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            response.send({
                success:true,
                releaseOrders: releaseOrders
            });
        }
    });
    
};

module.exports.deleteReleaseOrder = function(request, response){
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
            ReleaseOrder.findByIdAndRemove(request.params.id,function(err){
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
                        msg: "Ratecard deleted"
                    });
                }
                
            })
		}	
	});
};

module.exports.updateReleaseOrder = function(request, response){
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
            ReleaseOrder.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, releaseOrder){
                if(err){
                    console.log(err);
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else{
                    // if(request.body.OrganizationName){
                    //     client.OrganizationName = request.body.OrganizationName;
                    // }
                    response.send({
                        success:true,
                        msg: "ReleaseOrder Updated"
                    });
                }
                
            })
		}	
	});
};
