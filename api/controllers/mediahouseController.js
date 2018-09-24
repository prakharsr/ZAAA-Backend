var MediaHouse = require('../models/MediaHouse');
var mongoose = require('mongoose');
var perPage=20;


//http://localhost:8000/api/get/plans
module.exports.createMediahouse = function(request,response){
    var user = response.locals.user;
    var mediahouse = new MediaHouse({
        OrganizationName:request.body.organizationName,
        PublicationName:request.body.publicationName,
        NickName:request.body.nickName,
        MediaType:request.body.mediaType,
        Language:request.body.Language,
        Address:request.body.address,
        OfficeLandline:request.body.officeLandline,
        officeStdNo:request.body.officeStdNo,
        Scheduling:request.body.scheduling,
        global:false,
        pullouts:request.body.pullouts,
        GSTIN:request.body.GSTIN,
        Remark:request.body.Remark,
        firm : user.firm
        
    });
    mediahouse.save(function(err){
        if(err){
            console.log(err);
            response.send({
                success : false,
                msg : "cannot save media house data"
            })
        }
        else{
            response.send({
                success : true,
                msg : "mediahouse data saved"
            })
        }
    });    
};
//http://localhost:8000/api/get/plans
module.exports.createMediahouseFromRO = function(request,response){
    var user = response.locals.user;
    MediaHouse.find({$and: [{OrganizationName:request.body.organizationName},{PublicationName:request.body.publicationName},{"Address.edition":request.body.address.edition}, {GSTIN:request.body.GSTIN}]}, function(err, mediahouse){
        if(err){
            console.log("Error in searching for existence of mediahouse.");
            response.send({
                success:false,
                msg: err + ""
            });
        }
        else if (!mediahouse){
            var pullout = [{Name:request.body.pulloutName, Frequency:"Daily", Language:"", Remark:""}]
            var mediahouse = new MediaHouse({
                OrganizationName:request.body.organizationName,
                PublicationName:request.body.publicationName,
                NickName:request.body.nickName,
                MediaType:request.body.mediaType,
                Address:request.body.address,
                OfficeLandline:request.body.officeLandline,
                officeStdNo:request.body.officeStdNo,
                pullouts: pullout,
                Scheduling:request.body.scheduling,
                global:false,
                GSTIN:request.body.GSTIN,
                Remark:request.body.Remark,
                firm : user.firm
                
            });
            mediahouse.save(function(err){
                if(err){
                    console.log(err);
                    response.send({
                        success : false,
                        msg : "cannot save media house data"
                    })
                }
                else{
                    response.send({
                        success : true,
                        msg : "mediahouse data saved"
                    })
                }
            });
            
        }
        else{
            response.send({
                success:false,
                msg: "MediaHouse exist already."
            })
        }
        
    })    
};

module.exports.getMediaHouse = function(request,response){
    var user = response.locals.user;
    MediaHouse.findById(request.params.id,function(err, mediahouse){
        
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
                mediahouse : mediahouse
            }); 
        }
    });
};

function findMediaHouses(request,response, global){
    var user = response.locals.user;
    MediaHouse.find(global ? {global:global} : {firm:mongoose.mongo.ObjectId(user.firm)})
    .limit(perPage)
    .skip((perPage * request.params.page) - perPage)
    .exec(function(err, mediahouses){
        
        if(err){
            console.log("here" +err);
        }
        else{
            MediaHouse.count(global?{global:global}:{firm:mongoose.mongo.ObjectId(user.firm)}).exec( function(err, count)
            {
                console.log(mediahouses)
                response.send({
                    success : true,
                    mediahouses : mediahouses,
                    perPage:perPage,
                    page:request.params.page,
                    pageCount: Math.ceil(count/perPage)
                });
            });
        }
    });  
};

module.exports.getLocalMediahouses = function(request,response){
    findMediaHouses(request, response, false);
};
module.exports.getGlobalMediahouses = function(request,response){
    findMediaHouses(request, response, true);
};

module.exports.queryMediaHouse = function(request, response){
    var user = response.locals.user;
    MediaHouse.find({
        $and : [{$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}, {$or:[{ 'PublicationName': { $regex: request.params.keyword+"", $options:"i" }}, { 'OrganizationName': { $regex: request.params.keyword+"", $options:"i" }},{ 'Address.edition': { $regex: request.params.keyword+"", $options:"i" }},{ 'NickName': { $regex: request.params.keyword+"", $options:"i" }}]}]
    })
    .sort('OrganizationName')
    .limit(5).exec(function(err, mediahouses){
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
                mediahouses: mediahouses
            });
        }
    }); 
};

module.exports.queryMediaHouseEdition = function(request, response){
    var user = response.locals.user;
    MediaHouse.find({
        $and : [{$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}, {$and:[{ 'PublicationName': request.params.PublicationName}, { 'Address.edition': { $regex: request.params.keyword+"", $options:"i" }}]}]
    })
    .sort('OrganizationName')
    .limit(5).exec(function(err, mediahouses){
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
                mediahouses: mediahouses
            });
        }
    });
};

module.exports.deleteMediahouse = function(request, response){
	var user = response.locals.user;
    MediaHouse.findByIdAndRemove(request.params.id,function(err){
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
                msg: "MediaHouse deleted"
            });
        }
        
    })
};

module.exports.updateMediaHouse = function(request, response){
    var user = response.locals.user;
    delete request.body.createdAt;
    delete request.body.updatedAt;
    MediaHouse.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, mediahouses){
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
                msg: "MediaHouse Updated"
            });
        }
        
    })
};
