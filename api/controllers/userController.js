var config = require('../../config');
var User = require('../models/User');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var Notification = require('../../admin/models/Notifications')
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var bcrypt = require('bcrypt');
var api_key = config.mailgun_api_key;
var DOMAIN = config.DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
var SALT_WORK_FACTOR = 10;
var perPage=20;

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
				
				user.sendPassword( password,function(err, user){
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
	var user = res.locals.user;
	var reqBody = req.body;
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
};

module.exports.verifyMobile = function(request, response) {
	var user = response.locals.user;
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
	};
	function getUser(token,req,res, cb){
		var decoded = jwt.verify(token, config.SECRET, function(err,decoded){
			User.findById(decoded.id, function(err, doc) {
				if (err || !doc) {
					return  cb(err,null);
				}
				else{
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
		}
		else {
			return null;
		}
	};
	
	module.exports.getToken = getToken;
	module.exports.getUser = getUser;
	module.exports.profileImage = function(request,response){
		var user = response.locals.user;
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
	module.exports.deleteProfileImage = function(request,response){
		var user = response.locals.user;
		user.photo = '/images/profile.jpg' ;
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
					msg : "Profile photo removed.",
					photo: user.photo
				});
			}
		});
	}	
	module.exports.signature = function(request,response){
		var user = response.locals.user;
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
									sign: user.sign
								});
							}
						});
					}
				});
			}
		});
	}
	module.exports.deleteSignature = function(request,response){
		var user = response.locals.user;				
		user.signature = '/images/sign.png' ;
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
					sign: user.sign
				});
			}
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
		var user = response.locals.user;
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
	};
	
	module.exports.setUserProfile = function(request, response){
		var user = response.locals.user;
		if(request.body.name)
		user.name = request.body.name;
		
		if (request.body.designation)
		user.designation = request.body.designation;
		
		user.save(function(err){
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
		var user = response.locals.user;
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
	};
	
	module.exports.sendPasswordResetEmail = function(request,response){
		var user = User.findOne({email : request.body.email.toLowerCase()}, function(err,user){
			if(err) throw err;
			if(!user){
				response.send({
					success: false,
					msg: 'Authentication Failed'
				});
			}
			else{
				var now = new Date();
				var time = new Date(now).getTime();
				var token_data = {
					id: user._id,
					time: time,
					reset : true
				};
				var token = jwt.sign(token_data, config.SECRET);
				var data = {
					from: 'AAMan <postmaster@adagencymanager.com>',
					to: request.body.email,
					subject: 'Password Reset Link',
					text: config.domain+'/reset_password/'+token,
				};
				
				mailgun.messages().send(data, function (error, body) {
					console.log(error,body);
					if(error){
						response.send({
							success:false,
							msg: error + ""
						});
					}
					else{
						response.send({
							success:true,
							msg: "sent" + body
						});
					}
				});
			}
		})
	}
	
	module.exports.resetPassword = function(request,response){
		var decoded = jwt.verify(request.body.token, config.SECRET, function(err,decoded){
			var now = new Date();
			var time = new Date(now).getTime();
			if(!decoded.reset){
				response.status(403).send("You are not authorised to view this page");
			}
			else if(time - decoded.time > 900000){
				response.status(403).send("The token has expired");
			}
			else{
				User.findById(decoded.id, function(err,user){
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
						user.password = request.body.password;
						user.save(function(err){
							if(err) {
								console.log(err);
								response.send({
									success : false,
									msg : 'Cannot save user'
								});
							}
							else{
								response.send({
									success : true,
									msg : 'password successfully changed'
								});
							}
						});
					}
				})
			}
		});
		
	};
	
	module.exports.saveToken = (request,response) =>{
		var user = response.locals.user;
		if(user.deviceTokens.findIndex(M => M.token == request.body.token)==-1){
			user.deviceTokens.push({
				token: request.body.token
			});

			user.save(err => {
				if(err){
					response.send({
						success: false,
						msg: 'Cannot save token'
					})
				}
				else{
					response.send({
						success: true,
						msg: 'token saved'
					})
				}
			})
		}
	}

	module.exports.logout = (request,response) => {
		var user = response.locals.user;
		user.deviceTokens  = user.deviceTokens.filter(tokens=>tokens!==request.body.token)
		user.save(err => {
			if(err) {
				response.send({
					success : false,
					msg: "Cannot log out"
				});
			}
			else{
				response.send({
					success : true,
					msg: "Logged out"
				});
			}
		})
	}


module.exports.getNotifications = (request,response) =>{
    Notification.find({})
    .limit(perPage)
    .skip((perPage * request.body.page) - perPage)
    .exec(function(err, notifications){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            Notification.count({}, function(err, count){
                response.send({
                    success:true,
                    notifications: notifications,
                    page: request.body.page,
                    perPage:perPage,
                    pageCount: Math.ceil(count/perPage)
                });
            })
            
        }
    });
}

module.exports.getLastSeen = (request,response) => {
	var user = response.locals.user;
	response.send({
		success: true,
		lastSeen: user.lastSeen
	});
}

module.exports.setLastSeen = (request, response) => {
	var user = response.locals.user;
	user.lastSeen = new Date();
	user.save( err => {
		if(err){
			response.send({
                success:false,
                msg: err +""
            });
		}
		else{
			response.send({
                success:true,
                msg: "Updated"
            });
		}
	})
}
module.exports.getCurrentUserDetails= function(request, response){
	var user = response.locals.user;
	var firm = response.locals.firm;
	Plan.findById(mongoose.mongo.ObjectID(firm.plan.planID), function(err,plan){
		response.json({
			success:true,
			user:user,
			firm:firm,
			plan:plan
		});
	})
}; 