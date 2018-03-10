var config = require('../../config');
var MediaHouse = require('../models/MediaHouse');
var userController = require('./users');
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
		if(err||!user){
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
                Edition:request.body.edition,
                Address:request.body.address,
                OfficeLandline:request.body.officeLandline,
                Scheduling:request.body.scheduling,
                global:{
                    type:Boolean,
                    default:false
                }, 
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
                        msg : mediahouse + ""
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
            
            MediaHouse.find({firm:mongoose.mongo.ObjectId(user.firm),global:global},null,function(err, mediahouses){
                
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
            Client.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, mediahouses){
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
