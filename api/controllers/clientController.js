var Client = require('../models/Client');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;

//http://localhost:8000/api/get/plans
module.exports.createClient = function(request,response){
	var user = response.locals.user;
    var client = new Client({
        OrganizationName:request.body.organizationName,
        CompanyName:request.body.companyName,
        NickName:request.body.nickName,
        CategoryType:request.body.categoryType,
        SubCategoryType:request.body.SubCategoryType,
        IncorporationDate:request.body.IncorporationDate,
        Address:request.body.address,
        stdNo:request.body.stdNo,
        Landline:request.body.landline,
        Website:request.body.website,
        PanNO:request.body.panNo,
        GSTIN:request.body.GSTIN,
        ContactPerson:request.body.contactPerson,
        Remark:request.body.Remark,
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
};
module.exports.createClientFromRO = function(request,response){
	var user = response.locals.user;
    Client.find({
        $and : [
            {$or:[{firm:mongoose.mongo.ObjectId(user.firm)},
                {global:true}
            ]}, 
            {$or:[{ 'CompanyName': { $regex: request.params.keyword+"", $options:"i" }}, 
            { 'OrganizationName': { $regex: request.params.keyword+"", $options:"i" }},
            { Address: { $regex: request.params.keyword+"", $options:"i" }},
            { 'NickName': { $regex: request.params.keyword+"", $options:"i" }
        }]
    }]
})
.sort('OrganizationName')
.limit(5)            
.exec(function(err, client){
    if(err){
        console.log("Error in searching for existence of Client.");
        response.send({
            success:false,
            msg: err + ""
        });
    }
    else if (!client){
        var client = new Client({
            OrganizationName:request.body.organizationName,
            CompanyName:request.body.companyName,
            Address:request.body.address,
            GSTIN:request.body.GSTIN,
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
    else{
        response.send({
            success:false,
            msg: "Client exist already."
        })
    }
    
})
};

module.exports.getClient = function(request,response){
    var user = response.locals.user;
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
};

module.exports.getClients = function(request,response){
    var user = response.locals.user;
    Client.find({firm:mongoose.mongo.ObjectId(user.firm)})
    .limit(perPage)
    .skip((perPage * request.params.page) - perPage)
    .exec(function(err, clients, count)
    {
        
        if(err){
            console.log("here" +err);
        }
        else{
            Client.count().exec(
                function(err, count)
                {
                    response.send({
                        success : true,
                        clients : clients,
                        perPage:perPage,
                        page:request.params.page,
                        pageCount: Math.ceil(count/perPage)
                    });
                }
            )
            
        }
    });
};

module.exports.deleteClient = function(request, response){
    var user = response.locals.user;
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
};
module.exports.queryClients = function(request, response){
    var user = response.locals.user;
    Client.find({
        $and : [{$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}, {$or:[{ 'OrganizationName': { $regex: request.params.keyword+"", $options:"i" }}, { 'CompanyName': { $regex: request.params.keyword+"", $options:"i" }},{ 'NickName': { $regex: request.params.keyword+"", $options:"i" }},{ 'CategoryType': { $regex: request.params.keyword+"", $options:"i" }}]}]
    })
    .sort('OrganizationName')
    .limit(5).exec(function(err, clients){
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
    var user =response.locals.user;
    delete request.body.createdAt;
    delete request.body.updatedAt;
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
};

module.exports.profileImage = function(request,response){
    var user = response.locals.user;
    Client.findById(mongoose.mongo.ObjectId(request.params.id), function(err,client){
        if(err){
            response.send({
                success:false,
                msg: err +""
            });
        }
        else if(!client){
            response.send({
                success:false,
                id: request.params.id + ""
            });
        }
        else{
            var dirname = __dirname+'/../../public/uploads/'+user.firm +'/Clients/';
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
                            location = '/uploads/'+user.firm+'/Clients/'+file.fieldname + '-'+client._id+path.extname(file.originalname);
                            cb(null, file.fieldname + '-'+client._id+path.extname(file.originalname));
                        }
                    });                            
                    var upload = multer({storage : storage}).single('client');
                    upload(request,response,function(err){
                        if(err){
                            response.send({
                                success : false,
                                msg : "error uploading file." + err
                            });
                        }
                        else{
                            client.ContactPerson.Photo = location;
                            client.save(function(err,doc){
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
                                        photo: client.photo
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
module.exports.profileImage2 = async (request,response) => {
    var user = response.locals.user;
    var firm = response.locals.firm;
    var client = await Client.findById(mongoose.mongo.ObjectId(request.params.id));
    if (req.file && req.file.cloudStoragePublicUrl) {
        client.ContactPerson.Photo = req.file.cloudStoragePublicUrl;
        client.save(function(err,doc){
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
                    photo:  req.file.cloudStoragePublicUrl
                });
            }
        });
    }
    else{
        response.send({
            success: false,
            msg: 'No File in the body'
        });
    }
}
module.exports.setContactPersonPhoto = function(request,response){
    var user = response.locals.user;
    Client.find({ '_id': mongoose.mongo.ObjectId(request.params.clientId), 'ContactPerson._id': mongoose.mongo.ObjectId(request.params.contactPersonId) }, function(err,client){
        if(err){
            response.send({
                success:false,
                msg: err +""
            });
        }
        else if(!client){
            response.send({
                success:false
            });
        }
        else{
            var dirname = __dirname+'/../../public/uploads/'+user.firm+'/Clients/';
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
                            location = '/uploads/'+user.firm+'/Clients/'+file.fieldname + '-'+client.ContactPerson[0]._id+path.extname(file.originalname);
                            cb(null, file.fieldname + '-'+client.ContactPerson[0]._id+path.extname(file.originalname));
                        }
                    });                            
                    var upload = multer({storage : storage}).single('client');
                    upload(request,response,function(err){
                        if(err){
                            response.send({
                                success : false,
                                msg : "error uploading file." + err
                            });
                        }
                        else{
                            
                            contactPerson.Photo = location;
                            client.save(function(err,doc){
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
                                        photo: client.ContactPerson[0].photo
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
