var Ratecard = require('../../api/models/Ratecard');
var MediaHouse = require('../../api/models/MediaHouse');

module.exports.createMediahouse = function(request,response){
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
