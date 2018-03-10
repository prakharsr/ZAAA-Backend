var config = require('../../config');
var Client = require('../models/Client');
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
module.exports.createClient = function(request,response){
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
            var client = new Client({
                OrganizationName:request.body.organizationName,
                CompanyName:request.body.companyName,
                NickName:request.body.nickName,
                CategoryType:request.body.categoryType,
                AddressState:request.body.addressState,
                Landline:request.body.landline,
                Website:request.body.website,
                PanNO:request.body.panNo,
                GSTNo:request.body.gstin,
                ContactPerson:request.body.contactPerson,
                firm : user.firm
                
            });
            client.save(function(err){
                if(err){
                    console.log(err);
                    response.send({
                        success : false,
                        msg : "cannot save client data"
                    })
                }
                else{
                    response.send({
                        success : true,
                        msg : "client data saved"
                    })
                }
            });
            
		}
	});	
    
};

module.exports.getClient = function(request,response){
    
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
            
            Client.findById(request.params.id,function(err, client){
                
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
                        msg : client + ""
                    }); 
                }
            });
			
		}
	});	
    
};
module.exports.getClients = function(request,response){
    
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
            
            Client.find({firm:mongoose.mongo.ObjectId(user.firm)},null,function(err, clients){
                
                if(err){
                    console.log("here" +err);
                }
                else{
                    response.send({
                        success : true,
                        clients : clients,
                    }); 
                }
            });
			
		}
	});	
    
};

module.exports.deleteClient = function(request, response){
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
            Client.findByIdAndRemove(request.params.id,function(err){
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
                        msg: "Client deleted"
                    });
                }

            })
		}	
	});
};

module.exports.updateClient = function(request, response){
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
            Client.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, client){
                if(err){
                    console.log(err);
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else{
                    // if(request.body.){
                    //     client. = request.body.;
                    // }
                    response.send({
                        success:true,
                        msg: "Client Updated"
                    });
                }

            })
		}	
	});
};
