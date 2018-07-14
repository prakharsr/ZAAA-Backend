var Admin = require('../models/Admin');
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
	if(!reqBody.email){
		res.json({
			success : false,
			msg : "Provide all the credentials to signup successfully"
		});
	}
	else{
		var admin = new Admin({
			createdOn: Date.now(),
			name:reqBody.name||reqBody.email.toLowerCase().substring(0, reqBody.email.indexOf("@")),
			email : reqBody.email.toLowerCase(),
			password : reqBody.password,
			phone:"",
			empno:'20'
        });
        
		admin.save(function(err, doc){
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
		var admin =	Admin.findOne({phone:req.body.phone}, function(err, admin){
			if(err) throw err;
			if(!admin){
				res.send({
					success: false,
					msg: 'Authentication Failed'
				});
			}
			else{
				admin.comparePassword(req.body.password, function(err, isMatch){
					if (isMatch && !err){
						var token_data = {
							id: admin._id,
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
		var admin =	Admin.findOne({email:req.body.email.toLowerCase()}, function(err, admin){
			if(err) throw err;
			if(!admin){
				res.send({
					success: false,
					msg: 'Authentication Failed'
				});
			}
			else{
				admin.comparePassword(req.body.password, function(err, isMatch){
					if (isMatch && !err){
						var token_data = {
							id: admin._id,
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

module.exports.profileImage = function(request,response){
	var admin = response.locals.admin;
	var dirname = __dirname+'/../../public/uploads/'+admin.empno;
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
					location = '/uploads/'+admin.empno+'/'+file.fieldname + '-'+admin._id+path.extname(file.originalname);
					cb(null, file.fieldname + '-'+admin._id+path.extname(file.originalname));
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
					admin.photo = location;
					admin.save(function(err,doc){
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
								photo: admin.photo
							});
						}
					});
				}
			});
		}
	});
}

module.exports.Aadhaar = function(request,response){
	var admin = response.locals.admin;
	var dirname = __dirname+'/../../public/uploads/'+admin.empno;
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
					location = '/uploads/'+admin.empno+'/'+file.fieldname + '-'+admin._id+path.extname(file.originalname);
					cb(null, file.fieldname + '-'+admin._id+path.extname(file.originalname));
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
					admin.AadharAtt = location;
					admin.save(function(err,doc){
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
								photo: admin.AadharAtt
							});
						}
					});
				}
			});
		}
	});
}

module.exports.IDAttachment = function(request,response){
	var admin = response.locals.admin;
	var dirname = __dirname+'/../../public/uploads/'+admin.empno;
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
					location = '/uploads/'+admin.empno+'/'+file.fieldname + '-'+admin._id+path.extname(file.originalname);
					cb(null, file.fieldname + '-'+admin._id+path.extname(file.originalname));
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
					admin.IdAtt = location;
					admin.save(function(err,doc){
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
								photo: admin.IdAtt
							});
						}
					});
				}
			});
		}
	});
}

module.exports.bankAttachment = function(request,response){
	var admin = response.locals.admin;
	var dirname = __dirname+'/../../public/uploads/'+admin.empno;
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
					location = '/uploads/'+admin.empno+'/'+file.fieldname + '-'+admin._id+path.extname(file.originalname);
					cb(null, file.fieldname + '-'+admin._id+path.extname(file.originalname));
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
					admin.BankAtt = location;
					admin.save(function(err,doc){
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
								photo: admin.BankAtt
							});
						}
					});
				}
			});
		}
	});
}

module.exports.OtherAtt1 = function(request,response){
	var admin = response.locals.admin;
	var dirname = __dirname+'/../../public/uploads/'+admin.empno;
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
					location = '/uploads/'+admin.empno+'/'+file.fieldname + '-'+admin._id+path.extname(file.originalname);
					cb(null, file.fieldname + '-'+admin._id+path.extname(file.originalname));
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
					admin.OtherAttachments.Att1 = location;
					admin.save(function(err,doc){
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
								photo: admin.OtherAttachments.Att1
							});
						}
					});
				}
			});
		}
	});
}


module.exports.OtherAtt2 = function(request,response){
	var admin = response.locals.admin;
	var dirname = __dirname+'/../../public/uploads/'+admin.empno;
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
					location = '/uploads/'+admin.empno+'/'+file.fieldname + '-'+admin._id+path.extname(file.originalname);
					cb(null, file.fieldname + '-'+admin._id+path.extname(file.originalname));
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
					admin.OtherAttachments.Att2 = location;
					admin.save(function(err,doc){
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
								photo: admin.OtherAttachments.Att2
							});
						}
					});
				}
			});
		}
	});
}


module.exports.OtherAtt3 = function(request,response){
	var admin = response.locals.admin;
	var dirname = __dirname+'/../../public/uploads/'+admin.empno;
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
					location = '/uploads/'+admin.empno+'/'+file.fieldname + '-'+admin._id+path.extname(file.originalname);
					cb(null, file.fieldname + '-'+admin._id+path.extname(file.originalname));
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
					admin.OtherAttachments.Att3 = location;
					admin.save(function(err,doc){
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
								photo: admin.OtherAttachments.Att3
							});
						}
					});
				}
			});
		}
	});
}


module.exports.Aadhaar = function(request,response){
	var admin = response.locals.admin;
	var dirname = __dirname+'/../../public/uploads/'+admin.empno;
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
					location = '/uploads/'+admin.empno+'/'+file.fieldname + '-'+admin._id+path.extname(file.originalname);
					cb(null, file.fieldname + '-'+admin._id+path.extname(file.originalname));
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
					admin.AadharAtt = location;
					admin.save(function(err,doc){
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
								photo: admin.AadharAtt
							});
						}
					});
				}
			});
		}
	});
}


module.exports.deleteProfileImage = function(request,response){
	var admin = response.locals.admin;
	admin.photo = '/images/profile.jpg' ;
	admin.save(function(err,doc){
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
				photo: admin.photo
			});
		}
	});
}

   
		
module.exports.signature = function(request,response){
	var admin = response.locals.admin;
	var dirname = __dirname+'../../../public/uploads/'+admin.empno;
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
					location = '/uploads/'+admin.empno+'/'+file.fieldname +'-'+admin._id+path.extname(file.originalname);
					cb(null, file.fieldname + '-'+admin._id+path.extname(file.originalname));
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
					admin.signature = location;
					admin.save(function(err,doc){
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
								sign: admin.sign
							});
						}
					});
				}
			});
		}
	});
}
module.exports.deleteSignature = function(request,response){
	var admin = response.locals.admin;
	admin.signature = '/images/sign.png' ;
	admin.save(function(err,doc){
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
				msg : "Deleted",
				sign: admin.sign
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
	Admin.findOneAndRemove({_id : mongoose.mongo.ObjectId(request.params.id)}, function(err){
		if(err){
			console.log(err);
			response.send({
				success : false,
				msg : err
			})
		}
		else{
			response.send({
				success : true,
				msg : "User deleted"
			});
		};
	});
};

module.exports.setUserProfile = function(request, response){
	var admin = response.locals.admin;
	Admin.findByIdAndUpdate(mongoose.mongo.ObjectId(admin._id),{$set:request.body},function(err, admin){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg: err + ""
			});
		}
		else{
			admin.save(function(err){
				if(err)
				{
					console.log(err)
				}
				else{
					response.send({
						success:true,
						msg: "Admin Profile Updated"
					});
				}
			});
		}
	});
}

module.exports.changePassword=function(request, response){
	var admin = response.locals.admin;
	admin.comparePassword(request.body.oldPassword, function(err, isMatch,admin){
	if(isMatch && !err){
		admin.password = request.body.newPassword;
		admin.save(function(err){
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
					admin:admin
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
	});
};
