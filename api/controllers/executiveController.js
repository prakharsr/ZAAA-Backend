var config = require('../../config');
var Executive = require('../models/Executive');
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
var perPage=20;

//http://localhost:8000/api/get/plans
module.exports.createExecutive = function(request,response){
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
            var executive = new Executive({
                OrganizationName:request.body.organizationName,
                CompanyName:request.body.companyName,
                ExecutiveName:request.body.executiveName,
                Designation:request.body.designation,
                Department:request.body.department,
                MobileNo:request.body.mobileNo,
                EmailId:request.body.email,
                Photo:request.body.photo,
                DateOfBirth:request.body.dob,
                Anniversary:request.body.anniversary,
                Remark:request.body.Remark,    
                firm : user.firm
                
            });
            executive.save(function(err){
                if(err){
                    console.log(err);
                    response.send({
                        success : false,
                        msg : "cannot save executive data"
                    })
                }
                else{
                    response.send({
                        success : true,
                        msg : "executive data saved"
                    })
                }
            });
            
		}
	});	
    
};
module.exports.createExecutiveFromRO = function(request,response){
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err){
            console.log("Error in creating Executive");
            if(err.CODE == "110000")
            {
			response.send({
				success:false,
				msg:"Exwcutive details needs to be unique."
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
            Executive.find({$and: [{OrganizationName:request.body.organizationName},{PublicationName:request.body.publicationName},{"Address.edition":request.body.address.edition}, {GSTIN:request.body.GSTIN}]}, function(err, executive){
                if(err){
                    console.log("Error in searching for existence of mediahouse.");
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else if (!executive){
                   var executive = new Executive({
                        OrganizationName:request.body.organizationName,
                        CompanyName:request.body.companyName,
                        ExecutiveName:request.body.executiveName,
                        Designation:request.body.designation,
                        Department:request.body.department,
                        MobileNo:request.body.mobileNo,
                        EmailId:request.body.email,
                        Photo:request.body.photo,
                        DateOfBirth:request.body.dob,
                        Anniversary:request.body.anniversary,
                        Remark:request.body.Remark,    
                        firm : user.firm
                        
                    });
                    executive.save(function(err){
                        if(err){
                            console.log(err);
                            response.send({
                                success : false,
                                msg : "cannot save executive data"
                            })
                        }
                        else{
                            response.send({
                                success : true,
                                msg : "executive data saved"
                            })
                        }
                    });
                    
                }
                else{
                    response.send({
                        success:false,
                        msg: "Executive exist already."
                    })
                }

            })

		}
	});	
    
};


module.exports.getExecutive = function(request,response){
    
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
            
            Executive.findById(request.params.id,function(err, executive){
                
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
                        executive : executive
                    }); 
                }
            });
			
		}
	});	
    
};
module.exports.getExecutives = function(request,response){
    
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
            
            Executive.find({firm:mongoose.mongo.ObjectId(user.firm)})
            .limit(perPage)
            .skip((perPage*request.params.page) - perPage)
            .exec(function(err, executives){
                
                if(err){
                    console.log("here" +err);
                }
                else{
                    Executive.count().exec(function(err, count)
                {
                    response.send({
                        success : true,
                        executives : executives,
                        perPage: perPage,
                        page:request.params.page,
                        pageCount: Math.ceil(count/perPage)
                    });
                });
                }
            });
			
		}
	});	
    
};

module.exports.deleteExecutive = function(request, response){
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
            Executive.findByIdAndRemove(request.params.id,function(err){
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
                        msg: "Executive deleted"
                    });
                }
                
            })
		}	
	});
};



module.exports.queryExecutives = function(request, response){
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
            Executive.find({
                $and : [{$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}, {$or:[{ 'OrganizationName': { $regex: request.params.keyword+"", $options:"i" }},{ 'ExecutiveName': { $regex: request.params.keyword+"", $options:"i" }}]}]
            })
            .sort('OrganizationName')
            .limit(5).exec(function(err, executives){
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
                        executives: executives
                    });
                }
            });
		}	
	});
    
};

module.exports.queryExecutiveOrganization = function(request, response){
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
            Executive.find({
                $and : [{$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}, { 'ExecutiveName': request.body.ExecutiveName}]
            })
            .sort('OrganizationName')
            .limit(5).exec(function(err, executives){
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
                        executives: executives
                    });
                }
            });
            
		}	
	});
    
};




module.exports.updateExecutive = function(request, response){
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
            Executive.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, executive){
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
                        msg: "executive Updated"
                    });
                }
                
            })
		}	
	});
};
module.exports.profileImage = function(request,response){
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
			response.send({
				success:false,
				msg:"user not found"
			});
		}
		else{
            Executive.findById(mongoose.mongo.ObjectId(request.params.id), function(err,executive){
                if(err){
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else if(!executive){
                    response.send({
                        success:false,
                        id: request.params.id + ""
                    });
                }
                else{
                    var dirname = __dirname+'/../../public/uploads/'+user.firm +'/Executives/';
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
                                    location = '/uploads/'+user.firm+'/Executives/'+file.fieldname + '-'+executive._id+path.extname(file.originalname);
                                    cb(null, file.fieldname + '-'+executive._id+path.extname(file.originalname));
                                }
                            });                            
                            var upload = multer({storage : storage}).single('executive');
                            upload(request,response,function(err){
                                if(err){
                                    response.send({
                                        success : false,
                                        msg : "error uploading file." + err
                                    });
                                }
                                else{
                                    
                                    executive.Photo = location;
                                    executive.save(function(err,doc){
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
                                                photo: executive.Photo
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
    });
}
