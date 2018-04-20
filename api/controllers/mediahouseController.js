var config = require('../../config');
var MediaHouse = require('../models/MediaHouse');
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
module.exports.createMediahouse = function(request,response){
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err){
            console.log("Error in creating MediaHouse");
            if(err.CODE == "110000")
            {
			response.send({
				success:false,
				msg:"Mediahouse details needs to be unique."
            });
            }
            else{
                response.send({
                    success:false,
                    msg:err+ ""
                })
            }
        }
        else if(!user){
            console.log("User not found");
            response.send({
				success:false,
				msg:err+""
			});
        }
		else{
            var mediahouse = new MediaHouse({
                OrganizationName:request.body.organizationName,
                PublicationName:request.body.publicationName,
                NickName:request.body.nickName,
                MediaType:request.body.mediaType,
                Address:request.body.address,
                OfficeLandline:request.body.officeLandline,
                officeStdNo:request.body.officeStdNo,
                Scheduling:request.body.scheduling,
                global:false,
                pullouts:request.body.pullouts,
                GSTIN:request.body.GSTIN,
                Remark:request.body.Remark,
                firm : user.firm
                
            });
            mediahouse.save(function(err){
                if(err){
                    console.log(err);
                    response.send({
                        success : false,
                        msg : "cannot save media house data"
                    })
                }
                else{
                    response.send({
                        success : true,
                        msg : "mediahouse data saved"
                    })
                }
            });
            
		}
	});	
    
};
//http://localhost:8000/api/get/plans
module.exports.createMediahouseFromRO = function(request,response){
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err){
            console.log("Error in creating MediaHouse");
            if(err.CODE == "110000")
            {
			response.send({
				success:false,
				msg:"Mediahouse details needs to be unique."
            });
            }
            else{
                response.send({
                    success:false,
                    msg:err+ ""
                })
            }
        }
        else if(!user){
            console.log("User not found");
            response.send({
				success:false,
				msg:err+""
			});
        }
		else{
            MediaHouse.find({$and: [{OrganizationName:request.body.organizationName},{PublicationName:request.body.publicationName},{"Address.edition":request.body.address.edition}, {GSTIN:request.body.GSTIN}]}, function(err, mediahouse){
                if(err){
                    console.log("Error in searching for existence of mediahouse.");
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else if (!mediahouse){
                    var mediahouse = new MediaHouse({
                        OrganizationName:request.body.organizationName,
                        PublicationName:request.body.publicationName,
                        NickName:request.body.nickName,
                        MediaType:request.body.mediaType,
                        Address:request.body.address,
                        OfficeLandline:request.body.officeLandline,
                        officeStdNo:request.body.officeStdNo,
                        Scheduling:request.body.scheduling,
                        global:false,
                        pullouts:request.body.pullouts,
                        GSTIN:request.body.GSTIN,
                        Remark:request.body.Remark,
                        firm : user.firm
                        
                    });
                    mediahouse.save(function(err){
                        if(err){
                            console.log(err);
                            response.send({
                                success : false,
                                msg : "cannot save media house data"
                            })
                        }
                        else{
                            response.send({
                                success : true,
                                msg : "mediahouse data saved"
                            })
                        }
                    });
                    
                }
                else{
                    response.send({
                        success:false,
                        msg: "MediaHouse exist already."
                    })
                }

            })

		}
	});	
    
};

module.exports.getMediaHouse = function(request,response){
    
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
            
            MediaHouse.findById(request.params.id,function(err, mediahouse){
                
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
                        mediahouse : mediahouse
                    }); 
                }
            });
			
		}
	});	
    
};

function findMediaHouses(request,response, global){
    
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
            
            MediaHouse.find(global ? {global:global} : {firm:mongoose.mongo.ObjectId(user.firm)},null,function(err, mediahouses){
                
                if(err){
                    console.log("here" +err);
                }
                else{
                    response.send({
                        success : true,
                        mediahouses : mediahouses,
                    }); 
                }
            });
			
		}
	});	
    
};

module.exports.getLocalMediahouses = function(request,response){
    findMediaHouses(request, response, false);
};
module.exports.getGlobalMediahouses = function(request,response){
    findMediaHouses(request, response, true);
};

module.exports.queryMediaHouse = function(request, response){
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
            MediaHouse.find({
                $and : [{$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}, {$or:[{ 'PublicationName': { $regex: request.params.keyword+"", $options:"i" }}, { 'OrganizationName': { $regex: request.params.keyword+"", $options:"i" }},{ 'Address.edition': { $regex: request.params.keyword+"", $options:"i" }},{ 'NickName': { $regex: request.params.keyword+"", $options:"i" }}]}]
            })
            .sort('OrganizationName')
            .limit(5).exec(function(err, mediahouses){
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
                        mediahouses: mediahouses
                    });
                }
            });
            
		}	
	});
    
};

module.exports.queryMediaHouseEdition = function(request, response){
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
            MediaHouse.find({
                $and : [{$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}, {$and:[{ 'PublicationName': request.params.PublicationName}, { 'Address.edition': { $regex: request.params.keyword+"", $options:"i" }}]}]
            })
            .sort('OrganizationName')
            .limit(5).exec(function(err, mediahouses){
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
                        mediahouses: mediahouses
                    });
                }
            });
            
		}	
	});
    
};

module.exports.deleteMediahouse = function(request, response){
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
            MediaHouse.findByIdAndRemove(request.params.id,function(err){
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
                        msg: "MediaHouse deleted"
                    });
                }
                
            })
		}	
	});
};

module.exports.updateMediaHouse = function(request, response){
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
            MediaHouse.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, mediahouses){
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
                        msg: "MediaHouse Updated"
                    });
                }
                
            })
		}	
	});
};
