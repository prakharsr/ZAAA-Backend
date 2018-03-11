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
                        client : client
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
module.exports.queryClients = function(request, response){
  
    Client.find({OrganizationName:{$regex:request.params.keyword+"",$options: "i"}}).sort({'OrganizationName': 1}).limit(5).exec(function(err, clients){
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
                clients: clients
            });
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

module.exports.profileImage = function(request,response){
	var token = getToken(request.headers);
	var user = getUser(token,request,response, function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}  
		else if(!user){
			response.send({
				success:false,
				msg:"user not found"
			});
		}
		else{
		var dirname = __dirname+'/../../public/uploads/'+user.firm +'/Clients/'+request.Name;
		mkdirp(dirname, function(err){
			if(err){
				response.send({
					success : false,
					msg : "Directory can not be created " + err
				})
			}
			else{
				var location;
				var storage = multer.diskStorage({
					destination: function(request,file,cb){
						cb(null,dirname);
					},
					filename: function(request, file,cb){
						location = '/uploads/'+user.firm+'/Clients/'+request.Name+'/'+file.fieldname + '-'+user._id+path.extname(file.originalname);
						cb(null, file.fieldname + '-'+user._id+path.extname(file.originalname));
					}
				});                            
				var upload = multer({storage : storage}).single('user');
				upload(request,response,function(err){
					if(err){
						response.send({
							success : false,
							msg : "error uploading file." + err
						});
					}
					else{
						user.photo = location;
						user.save(function(err,doc){
							if (err) {
								console.log(err);
								response.send({
									success: false,
									msg: err+""
								});
							} 
							else{
								response.send({
									success : true,
									msg : "File is uploaded.",
									photo: user.photo
								});
							}
						});
					}
				});
			}
		});
				
	}
});
}