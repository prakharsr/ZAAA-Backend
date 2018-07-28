var Ratecard = require('../../api/models/Ratecard');
var MediaHouse = require('../../api/models/MediaHouse');
var MediaHouseController = require('../../api/controllers/mediahouseController');
var RateCardController = require('../../api/controllers/ratecardController');

module.exports.createGMediahouse = function(request,response){
    var admin = response.locals.admin;
    var mediahouse = new MediaHouse({
        global:true,
        OrganizationName:request.body.organizationName,
        PublicationName:request.body.publicationName,
        NickName:request.body.nickName,
        MediaType:request.body.mediaType,
        Language:request.body.Language,
        Address:request.body.address,
        OfficeLandline:request.body.officeLandline,
        officeStdNo:request.body.officeStdNo,
        Scheduling:request.body.scheduling,
        pullouts:request.body.pullouts,
        GSTIN:request.body.GSTIN,
        Remark:request.body.Remark
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

module.exports.getGMediaHouse = MediaHouseController.getGlobalMediahouses;

module.exports.updateGMediahouse = function(request,response){
    MediaHouse.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, mediahouse){
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
}

module.exports.deleteGMediahouse = function(request,response){
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
}


function getMediahouseID(request, response){
    return new Promise((resolve, reject) => {
        MediaHouse.find({$and: [
            {PublicationName:request.body.bookingCenter.MediaHouseName},
            {"Address.edition":request.body.bookingCenter.Edition}
        ]}).exec( function(err, mediahouse){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (mediahouse.length == 0)
            {
                console.log('no mediahouse found');
                var newMediahouse = new MediaHouse({
                    OrganizationName:request.body.organizationName,
                    PublicationName:request.body.publicationName,
                    Address:request.body.address,
                    global:true,
                    GSTIN:request.body.GSTIN
                });
                
                newMediahouse.save(function(err, doc){
                    console.log('mediahouse saved');
                    mediahouseID = newMediahouse._id;
                    resolve(mediahouseID)
                })
            }
            if(mediahouse.length!==0){
                console.log("mediahouse found");
                console.log(mediahouse)
                mediahouseID =  mediahouse[0]._id;
                resolve(mediahouseID)
            }
        });
    })
}

module.exports.createGRatecard = async function(request,response){
    var mediaHouseID = await getMediahouseID(request,response);
    var ratecard = new RateCard({
        MediaType:request.body.mediaType,
        AdType:request.body.adType,
        AdWords:request.body.AdWords,
        AdWordsMax:request.body.AdWordsMax,
        AdTime:request.body.AdTime,
        RateCardType:request.body.rateCardType,
        BookingCenter:request.body.bookingCenter,
        mediahouseID:mediahouseID,
        Category:request.body.categories,
        Rate:request.body.rate,
        Position:request.body.position,
        Hue:request.body.hue,
        MaxSizeLimit: request.body.maxSizeLimit,
        MinSizeLimit:request.body.minSizeLimit,
        FixSize:request.body.fixSize,
        Scheme:request.body.scheme,
        Premium:request.body.premium,
        Tax:request.body.tax,
        ValidFrom:request.body.validFrom,
        ValidTill:request.body.validTill,
        Covered:request.body.covered,
        Remarks:request.body.remarks,
        PremiumCustom:request.body.PremiumCustom,
        PremiumBox:request.body.PremiumBox,
        PremiumBaseColour:request.body.PremiumBaseColour,
        PremiumCheckMark:request.body.PremiumCheckMark,
        PremiumEmailId:request.body.PremiumEmailId,
        PremiumWebsite:request.body.PremiumWebsite,
        PremiumExtraWords:request.body.PremiumWebsite,
        global:true
    });
    ratecard.save(function(err){
        if(err){
            console.log(err);
            response.send({
                success : false,
                msg : "cannot save ratecard data"
            })
        }
        else{
            response.send({
                success : true,
                msg : "ratecard data saved"
            })
        }
    });
}

module.exports.getGRateCard = RateCardController.getGlobalRatecards;

module.exports.updateGRatecard = function(request,response){
    RateCard.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, ratecard){
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
                msg: "Ratecard Updated"
            });
        }
    })
}

module.exports.deleteGRatecard = function(request,response){
    RateCard.findByIdAndRemove(request.params.id,function(err){
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
                msg: "Ratecard deleted"
            });
        }  
    })
}
