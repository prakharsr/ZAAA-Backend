var config = require('../../config');
var RateCard = require('../models/Ratecard');
var userController = require('./userController');
var firmController = require('./firmController');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var MediaHouse = require('../models/MediaHouse');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;

function getMediahouseID(request, response, user){
    return new Promise((resolve, reject) => {
        MediaHouse.find({$and: [
            {PublicationName:request.body.bookingCenter.MediaHouseName},
            {"Address.edition":request.body.bookingCenter.Edition}
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
                var newMediahouse = new MediaHouse({
                    OrganizationName:request.body.organizationName,
                    PublicationName:request.body.publicationName,
                    Address:request.body.address,
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
                console.log(mediahouse)
                mediahouseID =  mediahouse[0]._id;
                resolve(mediahouseID)
            }
        });
    })
}
async function f(request, response, user)
{

    var mediaHouseID = await getMediahouseID(request,response,user);
    var ratecard = new RateCard({
        MediaType:request.body.mediaType,
        AdType:request.body.adType,
        AdWords:request.body.AdWords,
        AdWordsMax:request.body.AdWordsMax,
        AdTime:request.body.AdTime,
        RateCardType:request.body.rateCardType,
        BookingCenter:request.body.bookingCenter,
        mediahouseID:mediahouseID,
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
            f(request, response, user);
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
            RateCard.findById(request.params.id,async function(err, ratecard){
                try{
                    var mediahouse = await MediaHouse.find(ratecard.mediahouseID);
                    response.send({
                        success : true,
                        ratecard : ratecard,
                        mediahouse: mediahouse
                    }); 
                }
                catch(err){
                    console.log("here" +err);
                    response.send({
                        success:false,
                        msg: err+"",
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
            
            RateCard.find(global ? {global:global} : {firm:mongoose.mongo.ObjectId(user.firm)})
            .limit(perPage)
            .skip((perPage * request.params.page) - perPage)
            .exec(function(err, ratecards){
                
                if(err){
                    console.log("here" +err);
                }
                else{
                    RateCard.count(global ? {global:global} : {firm:mongoose.mongo.ObjectId(user.firm)})
                    .exec(function(err, count){
                        response.send({
                            success : true,
                            ratecards : ratecards,
                            perPage:perPage,
                            page: request.params.page,
                            pageCount: Math.ceil(count/perPage)
                        });
                    })
                     
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
             
    RateCard.find().and([{$or:[{global:true},{firm:user.firm}]},{$or:[{ 'BookingCenter.MediaHouseName': { $regex: request.params.keyword+"", $options:"i" }}, { 'BookingCenter.Edition': { $regex: request.params.keyword+"", $options:"i" }},{ 'Category.Main': { $regex: request.params.keyword+"", $options:"i" }},{ 'Category.Main': { $regex: request.params.keyword+"", $options:"i" }},{ 'Category.SubCategory1': { $regex: request.params.keyword+"", $options:"i" }}]}])
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
