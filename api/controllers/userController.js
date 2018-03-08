var config = require('../../config');
var User = require('../models/User');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;




//POST https://localhost:8000/api/signup
module.exports.signup = function(req,res){
	var reqBody = req.body;
	var password = Math.floor(100000+Math.random()*900000);
	if(!reqBody.email){
		res.json({
			success : false,
			msg : "Provide all the credentials to signup successfully"
		});
	}
	else{
		var firm = new Firm();
		var user = new User({
			createdOn: Date.now(),
			name:reqBody.name||reqBody.email.toLowerCase().substring(0, reqBody.email.indexOf("@")),
			email : reqBody.email.toLowerCase(),
			password : password,
			phone:"",
			isAdmin:true,
			firm : firm._id
		});
		
		firm.admins.push(user._id);
		firm.save(function(err,doc){
			if(err){
				console.log(err);
				throw err;
			}
		});
		
		user.save(function(err, doc){
			if(err){
				if(err.code == 11000){
					res.send({
						success : false,
						msg : "User already registered"
					});
				}
				else{
                    doc.sendPassword(password,function(err){
                        if(err){
                            console.log(err + "gftgvfh");
                        }
                    });
					res.send({
						success : false,
						msg : err
					});
				}
			}
			else {
				var token_data = {
					id: mongoose.mongo.ObjectId(doc._id),
					dateLogOn: new Date()
				};
				var token = jwt.sign(token_data, config.SECRET);
				
				user.sendVerificationMail( function(err, user){
					if(err){
						console.log(err);
						// response.send({
						// 	success:false,
						// 	msg:"failed"
						// });
						
					}
					else{
						// response.send({
						// 	success:true,
						// 	msg:"Verification mail sent to Your Email Address."
						// });
					}
				});
				
				res.json({
					success:true,
					token:"JWT "+ token,
					msg:"Signup complete"
				});
				
			}
		});
	}
};
//POST https://localhost:8000/api/login
module.exports.login = function(req,res){

	if(req.body.phone){
		var user =	User.findOne({phone:req.body.phone}, function(err, user){
			if(err) throw err;
			if(!user){
				res.send({
					success: false,
					msg: 'Authentication Failed'
				});
			}
			else{
				user.comparePassword(req.body.password, function(err, isMatch){
					if (isMatch && !err){
						var token_data = {
							id: user._id,
							dateLogOn: new Date()
						};
						var token = jwt.sign(token_data, config.SECRET);
						
						res.json({
							success:true,
							token:"JWT "+ token,
							msg:""
						});
					} else{
						res.send({
							success:false,
							msg: 'Authentication Failed'
						});
					}
				});
			}	
		});

	}
	else if (req.body.email){
		var user =	User.findOne({email:req.body.email.toLowerCase()}, function(err, user){
			if(err) throw err;
			if(!user){
				res.send({
					success: false,
					msg: 'Authentication Failed'
				});
			}
			else{
				user.comparePassword(req.body.password, function(err, isMatch){
					if (isMatch && !err){
						var token_data = {
							id: user._id,
							dateLogOn: new Date()
						};
						var token = jwt.sign(token_data, config.SECRET);
						
						res.json({
							success:true,
							token:"JWT "+ token,
							msg:""
						});
					} else{
						res.send({
							success:false,
							msg: 'Authentication Failed'
						});
					}
				});
			}	
		});
	}
};

module.exports.setMobile=function(req, res){
	var reqBody =req.body;
	console.log(reqBody);
	var token =  getToken(req.headers);
	var user = getUser(token,req,res, function(err, user){
		if(err) throw err;
		else{
			user.phone = reqBody.phone;
			user.save(function(err, doc) {
				if (err) {
					if (err.code == 11000) {
						return res.json({
							success: false,
							msg: "Username already exists"
						});
					} else {
						//Throw error message if not known
						res.send({
							success: false,
							msg: err +"bhjdw"
						});
					}
				} else {
					//We may not to want to always send SMS messages.
					if (config.enableValidationSMS == 1) {
						// If the user is created successfully, send them an account
						// verification token
						user.sendAuthyToken(function(err) {
							if (err) {
								res.send({
									success: false,
									msg: " in sendAuthyToken" + err
								});
							} else {
								// Send for verification page
								res.send({
									success: true,
									msg: doc._id
									
								});
							}
						});
					} else {
						
						//If we do not want to enable sms verification lets register and send confirmation
						res.send({
							success: true,
							msg: {
								msg: "Account created (SMS validation false)"
							}
						});
					}
				}
			});
		}
	});
};

module.exports.verifyMobile = function(request, response) {
	var token = getToken(request.headers);
	var user = getUser(token, request, response, function(err, user){
		if(err){
			console.log(err);
			return response.send({
				success: false,
				msg: "err" +err
			});		var _id = mongoose.mongo.ObjectId(decoded.id);
		}
		if(!user){
			return response.send({
				success:false,
				msg: "err not found" + err
			});
		}
		else{
			user.verifyAuthyToken(request.body.code, postVerify);
			// Handle verification response
			function postVerify(err, self) {
				if (err) {
					return response.send({
						success: false,
						msg: "The token you entered was invalid - please retry."
					});
				}
				
				// If the token was valid, flip the bit to validate the user account
				user.mobile_verified = true;
				user.save(postSave(err));
			}
			
			// after we save the user, handle sending a confirmation
			function postSave(err) {
				if (err) {
					return response.send({
						success: true,
						msg: "There was a problem validating your account."
					});
				}
				
				else{
					return response.send({
						success:true,
						msg:"phone number verified"});
					}
					
				}
				
				// respond with an error not current used
				function die(message) {
					response.send({
						success: false,
						msg: message
					});
				}
				
				
				
			}
		});
		
	}
		
function getUser(token,req,res, cb){
	console.log(token);
	var decoded = jwt.verify(token, config.SECRET, function(err,decoded){
		User.findById(decoded.id, function(err, doc) {
			if (err || !doc) {
				return  cb(err,null);
			}
			else{
				console.log(doc);
				return cb(null, doc);
			}
		});
	});
}
		
function getToken(headers) {
	if (headers && headers.authorization) {
		var parted = headers.authorization.split(' ');
		if (parted.length === 2) {
			return parted[1];
		} else {
			return null;
		}
	} else {
		return null;
	}
}

module.exports.getToken = getToken;
module.exports.getUser = getUser;
		
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
		var dirname = __dirname+'/../../public/uploads/'+user.firm;
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
						location = '/uploads/'+user.firm+'/'+file.fieldname + '-'+user._id+path.extname(file.originalname);
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
									msg: err+"gy"
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
   
		
module.exports.signature = function(request,response){
var token = getToken(request.headers);
	var user = getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		var dirname = __dirname+'../../../public/uploads/'+user.firm;
		mkdirp(dirname, function(err){
			if(err){
				response.send({
					success : false,
					msg : "Directory can not be created"
				})
			}
			else{
				var location;
				var storage = multer.diskStorage({
					destination: function(request,file,cb){
						cb(null,dirname);
					},
					filename: function(request, file,cb){
						location = '/uploads/'+user.firm+'/'+file.fieldname +'-'+user._id+path.extname(file.originalname);
						cb(null, file.fieldname + '-'+user._id+path.extname(file.originalname));
					}
				});                            
				var upload = multer({storage : storage}).single('sign');
				upload(request,response,function(err){
					if(err){
						response.send({
							success : false,
							msg : "error uploading file." + err
						});
					}
					else{
						user.signature = location;
						user.save(function(err,doc){
							if (err) {
								console.log(err);
								response.send({
									success: false,
									msg: err
								});
							} 
							else{
								response.send({
									success : true,
									msg : "File is uploaded.",
									photo: location
								});
							}
						});
					}
				});
			}
		});
	});
}

function removeA(arr) {
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax= arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}

module.exports.deleteUser = function(request, response){
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
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found"
			});
		}
		else{
			var firm = Firm.findById(mongoose.mongo.ObjectId(user.firm), function(err, firm){
				if(err){
					console.log(err);
				}
				else{
					if(user._id === mongoose.mongo.ObjectId(request.params.id) || !user.isAdmin)	return response.status(403).send("you cannot delete yourselves");
					else{
						firm.co_users.pull({ _id: mongoose.mongo.ObjectId(request.params.id) });
						firm.admins.pull({ _id: mongoose.mongo.ObjectId(request.params.id) });
						User.findOneAndRemove({_id : mongoose.mongo.ObjectId(request.params.id)}, function(err){
							if(err){
								console.log(err);
								response.send({
									success : false,
									msg : err
								})
							}
							else{
								firm.save(function(err){
									if(err){
										response.send({
											success : false,
											msg : err
										});
									}
									else{
										response.send({
											success : true,
											msg : "Co-User deleted"
										});
									}
								});
							}
						});
					}
				}
			});
		}	
	});
};

module.exports.setUserProfile = function(request, response){
	var token = getToken(request.headers);
	var user = getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		else{
			if(request.body.name)
			user.name = request.body.name;

			user.save(function(){
				if(err){
					console.log(err);
					response.send({
						success:false,
						msg:" error in set user profile" + err
					});
				}
				else{
					console.log(user);
					response.json({
						success:true,
						msg:"saved ",
						user:user
					});
				}
			});
			
		}
	});
	
};
module.exports.getUserProfile = function(request, response){
	var token = getToken(request.headers);
	var user = getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		else{
					console.log(user);
					response.json({
						success:true,
						msg:"user profile obtained ",
						user:user
					});
			
		}
	});
	
};
	
module.exports.getCurrentUser=function(request, response){
	var token = getToken(request.headers);
	var user = getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		else{
			response.send({
				success:true,
				user:user
			});
		}
	});
	
};

module.exports.changePassword=function(request, response){
	var token = getToken(request.headers);
	var user = getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err+"error in finding user"
			});
		}
		else{
			user.comparePassword(request.body.oldPassword, function(err, isMatch,user){
			if(isMatch && !err){
				user.password = request.body.newPassword;
				user.save(function(err){
					if(err){
						console.log(err);
						response.send({
							success:false,
							msg : err + "error saving"
						});
					}
					else{
						response.send({
							success:true,
							user:user
						});
					}
				});
			}
			else{
				response.send({
					success : false,
					msg : "Wrong Current Password"
				});
			}
			})
		}
	});
};

module.exports.setNewPassword = function(request, response){
	User.findById(request.body.id, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		else{
			
			user.password = request.body.newPassword;
				user.save(function(err){
					if(err){
						console.log(err);
						response.send({
							success:false,
							msg : err
						});
					}
					else{
						response.send({
							success:true,
							user:user
						});
					}
				});
		}
	});	
};
module.exports.resetPassword = function(request,response){
	User.findById(request.params.id, function(err,user){
		if(err){
			console.log(err)
			response.send({
				success:false,
				msg:err +" error"
			});
		}
		else if(!user){
			response.send({
				success:false,
				msg:"User not found for this Id",
			});
		}
		else{
			response.send({
				success:success,
				user:user,
				msg:"user exist"
			});
		}
	})
}
