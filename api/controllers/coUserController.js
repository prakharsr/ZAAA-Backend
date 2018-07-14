var config = require('../../config');
var User = require('../models/User');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var userController = require('./userController');


module.exports.createCoUser=function(request,response){
	var user = response.locals.user;
	var firm = response.locals.firm;
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

module.exports.getCoUsers= function(request, response){
	var user = response.locals.user;
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
