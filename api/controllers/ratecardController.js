var config = require('../../config');
var RateCard = require('../models/Ratecard');
var userController = require('./userController');
var firmController = require('./firmController');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');



//http://localhost:8000/api/get/plans
module.exports.createRatecard = function(request,response){
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
            var ratecard = new RateCard({
                MediaType:request.body.mediaType,
                AdType:request.body.adType,
                AdWords:request.body.AdWords,
                AdWordsMax:request.body.AdWordsMax,
                AdTime:request.bosy.AdTime,
                RateCardType:request.body.rateCardType,
                BookingCenter:request.body.bookingCenter,
                Category:request.body.categories,
                Rate:request.body.rate,
                Position:request.body.position,
                Hue:request.body.hue,
                MaxSizeLimit: request.body.maxSizeLimit,
                MinSizeLimit:request.body.minSizeLimit,
                FixSize:request.body.fixSize,
                Scheme:request.body.scheme,
                Premium:request.body.premium,
                Tax:request.body.tax,
                ValidFrom:request.body.validFrom,
                ValidTill:request.body.validTill,
                Covered:request.body.covered,
                Remarks:request.body.remarks,
                PremiumCustom:request.body.PremiumCustom,
                PremiumBox:request.body.PremiumBox,
                PremiumBaseColour:request.body.PremiumBaseColour,
                PremiumCheckMark:request.body.PremiumCheckMark,
                PremiumEmailId:request.body.PremiumEmailId,
                PremiumWebsite:request.body.PremiumWebsite,
                PremiumExtraWords:request.body.PremiumWebsite,

                firm :user.firm,
                global:false
            });
            ratecard.save(function(err){
                if(err){
                    console.log(err);
                    response.send({
                        success : false,
                        msg : "cannot save ratecard data"
                    })
                }
                else{
                    response.send({
                        success : true,
                        msg : "ratecard data saved"
                    })
                }
            });
            
		}
	});	
    
};

module.exports.getRatecard = function(request,response){
    
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
            
            RateCard.findById(request.params.id,function(err, ratecard){
                
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
                        ratecard : ratecard
                    }); 
                }
            });
			
		}
	});	
    
};

function findRatecards(request,response, global){
    
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
            
            RateCard.find(global ? {global:global} : {firm:mongoose.mongo.ObjectId(user.firm)},null,function(err, ratecards){
                
                if(err){
                    console.log("here" +err);
                }
                else{
                    response.send({
                        success : true,
                        ratecards : ratecards,
                    }); 
                }
            });
			
		}
	});	
    
};

module.exports.getLocalRatecards = function(request,response){
    findRatecards(request, response, false);
};
module.exports.getGlobalRatecards = function(request,response){
    findRatecards(request, response, true);
};

module.exports.queryRatecards = function(request, response){
    
    RateCard.find().or([{ 'OrganizationName': { $regex: request.params.keyword+"", $options:"i" }}, { 'PublicationName': { $regex: request.params.keyword+"", $options:"i" }},{ 'EmailId': { $regex: request.params.keyword+"", $options:"i" }},{ 'NickName': { $regex: request.params.keyword+"", $options:"i" }}]).sort('OrganizationName')
    .limit(5).exec(function(err, ratecards){
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
                ratecards: ratecards
            });
        }
    });
    
};

module.exports.deleteRatecard = function(request, response){
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
            RateCard.findByIdAndRemove(request.params.id,function(err){
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

module.exports.updateRatecard = function(request, response){
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
            RateCard.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, ratecard){
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
                        msg: "Ratecard Updated"
                    });
                }
                
            })
		}	
	});
};
