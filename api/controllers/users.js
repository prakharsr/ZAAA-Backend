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
	
	if(!reqBody.email || !reqBody.password ){
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
			password : reqBody.password,
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

module.exports.verifyEmail = function(request, response){
	var user = User.findById(request.params.id, function(err, user){
		if(!user){
			return response.send({
				success:false,
				msg: "err not found" + err
			});
		}
		else{
			user.email_verified = true;
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
					msg:"Email  verified"});
				}
				
			}
			
			// respond with an error not current used
			function die(message) {
				response.send({
					success: false,
					msg: message
				});
			}
			
			
			
		});
	}
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
		
		module.exports.setState = function(request,response){
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
					user.state = request.body.state;
					user.save(function(err, doc) {
						if (err) {
							response.send({
								success: false,
								msg: err
							});
						} else {
							response.send({
								success: true
							});
						}
					});
				}
			});	
		};
		
		module.exports.getState = function(request,response){
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
					if (err) {
						response.send({
							success: false,
							msg: err
						});
					} else {
						response.send({
							success: true,
							msg: {
								state : user.state
							}
						});
					}
				}
			});
		};
		
		
		module.exports.setPlan = function(request,response){
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
					Firm.findById(mongoose.mongo.ObjectId(user.firm),function(err,firm){
						if(err){
							console.log("error in finding firm" + err);
						}
						if(!firm){
							console.log("firm does not exist for this admin");
						}
						else{
							firm.plan.planID = request.body.planID;
							firm.plan.paymentID = request.body.paymentID;
							firm.plan.CreatedOn = Date.now();
							firm.save(function(err, doc) {
								if (err) {
									response.send({
										success: false,
										msg: err
									});
								} else {
									response.send({
										success: true,
										msg:doc._id +"bjhbyhjb  " + doc
									});
								}
							});
							
						}
					});
				}
			});
		};
		
		module.exports.setRtemplate = function(request,response){
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
					user.setRtemplate = Template;
					user.paymentID = request.body.paymentID;
					user.planCreatedOn = Date.now();
					user.save(function(err, doc) {
						if (err) {
							response.send({
								success: false,
								msg: err
							});
						} else {
							response.send({
								success: true,
								msg: {
									msg: doc.planID
								}
							});
						}
					});
				}
			});
		};
		
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
		
		
		module.exports.createCoUser=function(request,response){
			var token = getToken(request.headers);
			var user = getUser(token,request,response, function(err, user){
				if(err){
					console.log(err);
					response.send({
						success:false,
						msg:"1"
					});
				}
				else if(!user){
					console.log("5");
				}
				else{
					Firm.findById(mongoose.mongo.ObjectId(user.firm),function(err,firm){
						if(err){
							console.log("error in finding firm" + err);
						}
						if(!firm){
							console.log("firm does not exist for this admin");
						}
						else{
							var password = Math.floor(100000+Math.random()*900000);
							var planCreatedOn = firm.plan.planCreatedOn;
							console.log(firm.plan);
							var plan = Plan.findById(mongoose.mongo.ObjectID(firm.plan.planID), function(err, plan, planCreatedOn){
								if((firm.co_users.length + firm.admins.length) < (plan.maxUsers+1)){
					
									var CoUser = new User({
										createdOn: Date.now(),
										name: request.body.name||request.body.email.toLowerCase().substring(0, request.body.email.indexOf("@")),
										email : request.body.email.toLowerCase(),
										password : password,
										phone:request.body.phone,
										isAdmin:false,
										firm : firm._id
									});
									
									firm.co_users.push(CoUser._id);
									firm.save(function(err, doc) {
										if (err) {
											response.send({
												success: false,
												msg: err
											});
										} else {
											CoUser.save(function(err, doc){
												if(err){
													if(err.code == 11000){
														console.log(err);
														response.send({
															success : false,
															msg : "User already registered"
														});
													}
													else{
														console.log(err);	
														response.send({
															success : false,
															msg : err
														});
													}
												}
												else {
													doc.sendPassword(function(err, user,password){
														if(err){
															console.log(err + "gftgvfh");
														}
														else{
															
														}
													});
													response.json({
														success:true,
														msg:doc._id
													});
													
													
												}
											});
										}
									});
								}
								else{
									response.json({
										success:false,
										msg:"co_user limit for plan exceeded"
									});
								}
								
							})
							
						}
					});
				}
			});
		}
		
		module.exports.getCoUsers= function(request, response){
			var token = getToken(request.headers);
			var user = getUser(token,request,response, function(err, user){
				if(err){
					console.log(err);
					response.send({
						success:false,
						msg:"1"
					});
				}
				else if(!user){
					console.log("5");
				}
				else{
					User.find({firm:user.firm,isAdmin:false}).exec(function (err, co_users) {
						if (err||!co_users){
							if(err){
								response.json({
									success:false,
									msg: "err in finding co_users " + err
								});
							}
							else{
								response.json({
									success:false,
									msg: "no co_user for this admin/firm" + err
								});
							}
						}
						else{
							response.json({
								success:true,
								co_users: co_users,
							});
						}
					});
				}
			});
		}
		
		module.exports.createAdmins=function(request,response){
			var token = getToken(request.headers);
			var user = getUser(token,request,response, function(err, user){
				if(err){
					console.log(err);
					response.send({
						success:false,
						msg:"1"
					});
				}
				else if(!user){
					console.log("5");
				}
				else{
					var firm=	Firm.findById(mongoose.mongo.ObjectId(user.firm),function(err,firm){
						if(err){
							console.log("error in finding firm" + err);
						}
						if(!firm){
							console.log("firm does not exist for this admin");
						}
						else{
							var planCreatedOn = firm.plan.planCreatedOn;
							
							var plan = Plan.findById(mongoose.mongo.ObjectID(firm.plan.planID), function(err, plan, planCreatedOn){
								if((firm.co_users.length +firm.admins.length) < (plan.maxUsers+1)&&(firm.admins.length <plan.maxAdmins)){
									var newAdmin = new User({
										createdOn: Date.now(),
										name: request.body.name||request.body.email.toLowerCase().substring(0, request.body.email.indexOf("@")),
										email : request.body.email.toLowerCase(),
										password : request.body.password,
										phone:request.body.phone,
										isAdmin:true,
										firm : firm._id
									});
									
									firm.admins.push(newAdmin._id);
									firm.save(function(err, doc) {
										if (err) {
											response.send({
												success: false,
												msg: err
											});
										} else {
											CoUser.save(function(err, doc){
												if(err){
													if(err.code == 11000){
														console.log(err);
														response.send({
															success : false,
															msg : "User already registered"
														});
													}
													else{
														console.log(err);	
														response.send({
															success : false,
															msg : err
														});
													}
												}
												else {
													response.json({
														success:true,
														msg:doc._id
													});
													
												}
											});
										}
									});
								}
								else{
									response.json({
										success:false,
										msg:"Admin limit for plan exceeded"
									});
								}
								
							})
							
						}
					});
				}
			});
		}
		
		module.exports.getAdmins= function(request, response){
			var token = getToken(request.headers);
			var user = getUser(token,request,response, function(err, user){
				if(err){
					console.log(err);
					response.send({
						success:false,
						msg:"1"
					});
				}
				else if(!user){
					console.log("5");
				}
				else{
					User.find({firm:user.firm,isAdmin:true}).exec(function (err, admins) {
						if (err||!co_users){
							if(err){
								response.json({
									success:false,
									msg: "err in finding admins " + err
								});
							}
							else{
								response.json({
									success:false,
									msg: "no extra admin for this admin/firm" + err
								});
							}
						}
						else{
							response.json({
								success:true,
								admins: admins,
							});
						}
					});
				}
			});
		}
		
		
module.exports.setRole = function(request,response){
	var user = User.findById(mongoose.mongo.ObjectId(request.body.id) , function(err,user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		else{
			if(user.isAdmin){
				user.roles.all = true;
				user.save(function(err,doc){
					if (err) {
						console.log(err);
						response.send({
							success: false,
							msg: err
						});
					} else {
						response.send({
							success : true,
							msg : "Roles set for admin"
						});
					}
				});
			}
			else{
				user.roles.Release_order 		 = request.body.release_order;
				user.roles.Invoice				 = request.body.invoice;
				user.roles.Payment_receipts		 = request.body.payment_receipts;
				user.roles.Accounts				 = request.body.accounts;
				user.roles.Reports				 = request.body.reports;
				user.roles.directory.media_house = request.body.media_house;
				user.roles.directory.clients	 = request.body.clients;
				user.roles.directory.executives	 = request.body.executives;
				user.save(function(err,doc){
					if (err) {
						console.log(err);
						response.send({
							success: false,
							msg: err
						});
					} else {
						response.send({
							success : true,
							msg : "Roles set for co-user"
						});
					}
				});
			}
		}
	});
}
        
		
		module.exports.getRoles = function(request,response){
			var user = User.findById(mongoose.mongo.ObjectId(request.params.id) , function(err,user){
				if(err||!user){
					console.log("User not found");
					response.send({
						success:false,
						msg:err
					});
				}
				else{
					response.send({
						success : true,
						msg : user.roles
					});
				}
			});
		}
		
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
					if(user._id === mongoose.mongo.ObjectID(request.params.id) || !user.isAdmin)	return response.status(403).send("you cannot delete yourselves");
					else{
						firm.co_users.pull({ _id: mongoose.mongo.ObjectID(request.params.id) });
						firm.admins.pull({ _id: mongoose.mongo.ObjectID(request.params.id) });
						User.findOneAndRemove({_id : mongoose.mongo.ObjectID(request.params.id)}, function(err){
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
						if(request.body.designation)
						user.designation = request.body.designation;
						if(request.body.fb)
						user.Socials.fb=request.body.fb;
						if(request.body.twitter)
						user.Socials.twitter=request.body.twitter;
						if(request.body.other)
						user.Socials.other=request.body.other;
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
	
			module.exports.setFirmProfile = function(request, response){
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
						Firm.findById(mongoose.mongo.ObjectID(user.firm), function(err, firm){
						if(err){
							response.send({
							success : false,
								msg : "Firm not found"
							})
						}
						if(request.body.name)
						firm.FirmName = request.body.name;
						if(request.body.tagline)
						firm.TagLine = request.body.tagline;
						if(request.body.displayName)
						firm.DisplayName = request.body.displayName;
						if(request.body.registeredAddress)
						firm.RegisteredAddress = request.body.registeredAddress;
						if(request.body.incorporationDate)
						firm.IncorporationDate = request.body.incorporationDate;
						if(request.body.officeAddress)
						firm.OfficeAddress = request.body.officeAddress;
						if(request.body.fax)
						firm.Fax = request.body.fax;
						if(request.body.mobile)
						firm.Mobile = request.body.mobile;
						if(request.body.email)
						firm.Email = request.body.email;
						if(request.body.landline)
						firm.Landline = request.body.landline;
						if(request.body.website)
						firm.Website = request.body.website;
						if(request.body.pan)
						firm.PanNo = request.body.pan;
						if(request.body.gst)
						firm.GSTIN = request.body.gst;
						if(request.body.accountName)
						firm.BankDetails.AccountName = request.body.accountName;
						if(request.body.accountNo)
						firm.BankDetails.AccountNo = request.body.accountNo;
						if(request.body.ifsc)
						firm.BankDetails.IFSC = request.body.ifsc;
						if(request.body.bankName)
						firm.BankDetails.BankName = request.body.bankName;
						if(request.body.bankAddress)
						firm.BankDetails.BranchAddress = request.body.bankAddress;
						if(request.body.accountType)
						firm.BankDetails.AccountType = request.body.accountType;
						
						firm.save(function(err){
							if(err){
								console.log(err);
								response.send({
									success : false,
									msg : "cannot save firm data"
								})
							}
							else{
								response.send({
									success : true,
									msg : "Firm data updated"
								})
							}
						})
					});
					}
				});
				
			};
	module.exports.getFirmProfile = function(request, response){
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
				Firm.findById(mongoose.mongo.ObjectID(user.firm), function(err, firm){
					Plan.findById(mongoose.mongo.ObjectID(firm.plan.planID), function(err,plan){
						if(err){
							response.send({
								success:false,
								msg:"error in finding plan" + err,
								
							})
						}
						if(!plan){
							response.json({
								success:false,
								msg:"plan not found for the firm ",
								firm:firm
							});
						}
						else{
							response.json({
								success:true,
								msg:"firm profile obtained ",
								firm:firm,
								plan:plan
							});
						}
					})
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
module.exports.getCurrentFirm=function(request, response){
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
			Firm.findById(mongoose.mongo.ObjectID(user.firm), function(err, firm){
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
						user:user,
						firm:firm
					})
					
				}
			});
			
		}
	});
};

module.exports.getCurrentPlan=function(request, response){
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
			
			Firm.findById(mongoose.mongo.ObjectID(user.firm), function(err, firm){
				Plan.findById(mongoose.mongo.ObjectID(firm.plan.planID), function(err,plan){
					if(err){
						response.send({
							success:false,
							msg:"error in finding plan" + err,
							
						});
					}
					if(!plan){
						response.json({
							success:false,
							msg:"plan not found for the firm ",
							firm:firm
						});
					}
					else{
						response.json({
							success:false,
							msg:"plan  obtained ",
							user:user,
							firm:firm,
							plan:plan
						});
					}
				});
			});
		}
	});
}

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
module.exports.resetPasswordLinkgenerator = function(request, response){
	var email = request.body.email;
	User.find({email:request.body.email}, function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg: err
			});
	
		}
		else if (!user){
			console.log("user not found");
			response.send({
				success:false,
				msg: "user not found"
			});
		
		}
		else{
			user.sendPasswordResetMail(function(err, user){
				if(err){
					console.log(err);
					response.send({
						success:false,
						msg: err
					});
				}
				else{
					response.send({
						success:true,
						msg:" password reset link sent",
					});
				}
			})
		}
	});

}
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