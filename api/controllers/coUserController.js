var config = require('../../config');
var User = require('../models/User');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var userController = require('./users');


module.exports.createCoUser=function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
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
								isAdmin:request.body.isAdmin,
								designation : request.body.designation,
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
											doc.sendPassword(password,function(err){
												if(err){
													console.log(err + "gftgvfh");
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
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
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
			User.find({firm:user.firm}).exec(function (err, co_users) {
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
		
// module.exports.createAdmins=function(request,response){
// 	var token = userController.getToken(request.headers);
// 	var user = userController.getUser(token,request,response, function(err, user){
// 		if(err){
// 			console.log(err);
// 			response.send({
// 				success:false,
// 				msg:"1"
// 			});
// 		}
// 		else if(!user){
// 			console.log("5");
// 		}
// 		else{
// 			var firm=	Firm.findById(mongoose.mongo.ObjectId(user.firm),function(err,firm){
// 				if(err){
// 					console.log("error in finding firm" + err);
// 				}
// 				if(!firm){
// 					console.log("firm does not exist for this admin");
// 				}
// 				else{
// 					var planCreatedOn = firm.plan.planCreatedOn;
					
// 					var plan = Plan.findById(mongoose.mongo.ObjectId(firm.plan.planID), function(err, plan, planCreatedOn){
// 						if((firm.co_users.length +firm.admins.length) < (plan.maxUsers+1)&&(firm.admins.length <plan.maxAdmins)){
// 							var newAdmin = new User({
// 								createdOn: Date.now(),
// 								name: request.body.name||request.body.email.toLowerCase().substring(0, request.body.email.indexOf("@")),
// 								email : request.body.email.toLowerCase(),
// 								password : request.body.password,
// 								phone:request.body.phone,
// 								isAdmin:true,
// 								firm : firm._id
// 							});
							
// 							firm.admins.push(newAdmin._id);
// 							firm.save(function(err, doc) {
// 								if (err) {
// 									response.send({
// 										success: false,
// 										msg: err
// 									});
// 								} else {
// 									CoUser.save(function(err, doc){
// 										if(err){
// 											if(err.code == 11000){
// 												console.log(err);
// 												response.send({
// 													success : false,
// 													msg : "User already registered"
// 												});
// 											}
// 											else{
// 												console.log(err);	
// 												response.send({
// 													success : false,
// 													msg : err
// 												});
// 											}
// 										}
// 										else {
// 											response.json({
// 												success:true,
// 												msg:doc._id
// 											});
											
// 										}
// 									});
// 								}
// 							});
// 						}
// 						else{
// 							response.json({
// 								success:false,
// 								msg:"Admin limit for plan exceeded"
// 							});
// 						}
						
// 					})
					
// 				}
// 			});
// 		}
// 	});
// }
		
// module.exports.getAdmins= function(request, response){
// 	var token = userController.getToken(request.headers);
// 	var user = userController.getUser(token,request,response, function(err, user){
// 		if(err){
// 			console.log(err);
// 			response.send({
// 				success:false,
// 				msg:"1"
// 			});
// 		}
// 		else if(!user){
// 			console.log("5");
// 		}
// 		else{
// 			User.find({firm:user.firm,isAdmin:true}).exec(function (err, admins) {
// 				if (err||!co_users){
// 					if(err){
// 						response.json({
// 							success:false,
// 							msg: "err in finding admins " + err
// 						});
// 					}
// 					else{
// 						response.json({
// 							success:false,
// 							msg: "no extra admin for this admin/firm" + err
// 						});
// 					}
// 				}
// 				else{
// 					response.json({
// 						success:true,
// 						admins: admins,
// 					});
// 				}
// 			});
// 		}
// 	});
// }
		
		
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
