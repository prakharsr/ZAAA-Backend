var config = require('../../config');
var RateCard = require('../models/Ratecard');
var userController = require('./userController');
var firmController = require('./firmController');
var User = require('../models/User');
var ReleaseOrder = require('../models/ReleaseOrder');
var jwt = require('jsonwebtoken');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var MediaHouse = require('../models/MediaHouse');
var Executive = require('../models/Executive');
var Client = require('../models/Client');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');

module.exports.createRO = function(request, response){
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err){
			console.log("error in finding user");
			response.send({
				success:false,
				msg:err+""
			});
        }
        else if(!user)
        {
            console.log("User not found");
            response.send({
                success:false,
                msg:" no user"
        });

        }
		else{
            Firm.findById(user.firm, async function(err, firm){
				if(err){
					console.log("err in finding firm");
					response.send({
						success:false,
						msg:err + ""
					});
				}
				else{
                    var date = new Date()
                    var sn = firm.ROSerial+1;
                    var fname = firm.FirmName;
                    var shortname = fname.match(/\b\w/g).join('');
                    var city = firm.OfficeAddress.city;
                    var GSTIN = firm.GSTIN;
                    var gstin = GSTIN.GSTNo.substring(0,1);
                    var year = date.getFullYear();
                    var rno = year+'-'+gstin +'-'+shortname + '-'+city +'-'+sn;
                    console.log(rno);

                    await getIDsSan(request, user, firm,rno,response);
				}
			});
		}
	});	  
};

// async function getIDsZoku(request, user, firm){

//     var mediahouseID, clientID, executiveID;
//     var mediaHousePromise = MediaHouse.find({
//         $and: [
//             {OrganizationName:request.body.organizationName},
//             {PublicationName:request.body.publicationName},
//             {GSTIN:request.body.GSTIN}
//         ]
//     })
//     .exec()
//     .then(async function(mediahouse) {
//         if (!mediahouse){
//             var mediahouse = new MediaHouse({
//                 OrganizationName:request.body.organizationName,
//                 PublicationName:request.body.publicationName,
//                 NickName:request.body.nickName,
//                 MediaType:request.body.mediaType,
//                 Address:request.body.address,
//                 OfficeLandline:request.body.officeLandline,
//                 officeStdNo:request.body.officeStdNo,
//                 Scheduling:request.body.scheduling,
//                 global:false,
//                 pullouts:request.body.pullouts,
//                 GSTIN:request.body.GSTIN,
//                 Remark:request.body.Remark,
//                 firm : user.firm
//             });

//             await mediahouse.save().exec()
//                .then(() => mediahouseID = doc._id)
//                .catch(err => console.log(err));
//         }
//         else {
//             mediahouseID = mediahouse._id;
//         }
//     })
//     .catch(err => {
//         console.log("Error in searching for existence of mediahouse.");
//         console.log({
//             success:false,
//             msg: err + ""
//         });
//     });

//     var clientPromise = Client.find({
//         $and: [
//             {$or:[
//                  {firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}
//                 ,{$or:[{ 'CompanyName': { $regex: request.params.keyword+"", $options:"i" }}
//                 ,{'OrganizationName': { $regex: request.params.keyword+"", $options:"i" }}
//                 ,{Address: { $regex: request.params.keyword+"", $options:"i" }}
//                 ,{'NickName': { $regex: request.params.keyword+"", $options:"i" }}]
//             }]
//     }).exec()
//     .then(async function(client) {
//         if(!client){
//             var client = new Client({
//                 OrganizationName:request.body.organizationName,
//                 CompanyName:request.body.companyName,
//                 NickName:request.body.nickName,
//                 CategoryType:request.body.categoryType,
//                 SubCategoryType:request.body.SubCategoryType,
//                 IncorporationDate:request.body.IncorporationDate,
//                 Address:request.body.address,
//                 stdNo:request.body.stdNo,
//                 Landline:request.body.landline,
//                 Website:request.body.website,
//                 PanNO:request.body.panNo,
//                 GSTIN:request.body.GSTIN,
//                 ContactPerson:request.body.contactPerson,
//                 Remark:request.body.Remark,
//                 firm : user.firm
//             });
//              await client.save().exec()
//             .then(() => clientID = doc._id)
//             .catch(err => console.log(err));
//         }
//         else{
//             clientID = client._id;
//         }
//     })
//     .catch(err => {
//         console.log("Error in searching for existence of Client.");
//         console.log({
//             success:false,
//             msg: err + ""
//         });
//     });

//     var executivePromise = Executive.find({
//         $and: [
//             {OrganizationName:request.body.organizationName},
//             {PublicationName:request.body.publicationName},
//             {GSTIN:request.body.GSTIN}
//         ]
//     }).exec()
//     .then(async function(executive) {
//         if(!executive){
//             var executive = new Executive({
//                 OrganizationName:request.body.organizationName,
//                 CompanyName:request.body.companyName,
//                 NickName:request.body.nickName,
//                 CategoryType:request.body.categoryType,
//                 SubCategoryType:request.body.SubCategoryType,
//                 IncorporationDate:request.body.IncorporationDate,
//                 Address:request.body.address,
//                 stdNo:request.body.stdNo,
//                 Landline:request.body.landline,
//                 Website:request.body.website,
//                 PanNO:request.body.panNo,
//                 GSTIN:request.body.GSTIN,
//                 ContactPerson:request.body.contactPerson,
//                 Remark:request.body.Remark,
//                 firm : user.firm
//             });
//              await executive.save().exec()
//             .then(() => executiveID = doc._id)
//             .catch(err => console.log(err));
//         }
//         else{
//             executiveID = executive._id;
//         }
//     })
//     .catch(err => {
//         console.log("Error in searching for existence of Executive.");
//         console.log({
//             success:false,
//             msg: err + ""
//         });
//     });
//     await Promise.all(mediaHousePromise,clientPromise,executivePromise);

//     console.log({executiveID, mediahouseID, clientID});

//     // var releaseOrder = new ReleaseOrder({
//     //     date: request.body.date,
//     //     releaseOrderNO: rno,
//     //     agencyName: firm.FirmName,
//     //     agencyGSTIN: firm.GSTIN,
//     //     agencyPerson: user.name,
//     //     signature: user.signature,
//     //     clientName:request.body.clientName,
//     //     clientGSTIN:request.body.clientGSTIN,
//     //     clientState:request.body.clientState,
//     //     publicationName:request.body.publicationName,
//     //     publicationEdition:request.body.publicationEdition,
//     //     mediaType:request.body.mediaType,
//     //     publicationState:request.body.publicationState,
//     //     publicationGSTIN:request.body.publicationGSTIN,
//     //     adType:request.body.adType,
//     //     rate:request.body.rate,
//     //     unit:request.body.unit,
//     //     adCategory1:request.body.adCategory1,
//     //     adCategory2:request.body.adCategory2,
//     //     adCategory3:request.body.adCategory3,
//     //     adCategory4:request.body.adCategory4,
//     //     adCategory5:request.body.adCategory5,
//     //     adCategory6:request.body.adCategory6,
//     //     adHue:request.body.adHue,
//     //     adSizeL:request.body.adSizeL,
//     //     adSizeW:request.body.adSizeW,
//     //     AdWords:request.body.AdWords,
//     //     AdWordsMax:request.body.AdWordsMax,
//     //     adTime:request.body.adTime,
//     //     AdDuration:request.body.AdDuration,
//     //     adSizeCustom:request.body.adSizeCustom,
//     //     adSizeAmount:request.body.adSizeAmount,
//     //     adTotalSpace:request.body.adTotalSpace,
//     //     adEdition:request.body.adEdition,
//     //     adPosition:request.body.adPosition,
//     //     adSchemePaid:request.body.adSchemePaid,
//     //     adSchemeFree:request.body.adSchemeFree,
//     //     adTotal:request.body.adTotal,
//     //     adGrossAmount:request.body.adGrossAmount,

//     //     PremiumCustom:request.body.PremiumCustom,
//     //     PremiumBox:request.body.PremiumBox,
//     //     PremiumBaseColour:request.body.PremiumBaseColour,
//     //     PremiumEmailId:request.body.PremiumEmailId,
//     //     PremiumCheckMark:request.body.PremiumCheckMark,
//     //     PremiumWebsite:request.body.PremiumWebsite,
//     //     PremiumExtraWords:request.body.PremiumExtraWords,

//     //     publicationDiscount:request.body.publicationDiscount,
//     //     agencyDiscount1:request.body.agencyDiscount1,
//     //     agencyDiscount2:request.body.agencyDiscount2,
//     //     taxAmount:request.body.taxAmount,
//     //     taxIncluded:request.body.taxIncluded,
//     //     netAmountFigures:request.body.netAmountFigures,
//     //     netAmountWords:request.body.netAmountWords,
//     //     caption:request.body.caption,
//     //     remark:request.body.remark,
//     //     paymentType:request.body.paymentType,
//     //     paymentDate:request.body.paymentDate,
//     //     paymentNo:request.body.paymentNo,
//     //     paymentAmount:request.body.paymentAmount,
//     //     paymentBankName:request.body.paymentBankName,
        
//     //     executiveName:request.body.executiveName,
//     //     executiveOrg:request.body.executiveOrg,
//     //     otherCharges:request.body.otherCharges,
//     //     otherRemark:request.body.otherRemark,
//     //     firm:user.firm,
//     //     mediahouseID : mediahouseID,
//     //     clientID: clientID,
//     //     executiveID: executiveID,
//     //     insertions:request.body.insertions,
//     //     // if (taxIncluded){
//     //     //     FinalAmount = (adGrossAmount/(100+taxAmount))*100;
//     //     //     FinalTaxAmount = (adGrossAmount/(100+taxAmount))*taxAmount
//     //     // }
//     // });

//     // await releaseOrder.save().exec()
//     // .then(() => { 
//     //     firm.ROSerial += 1;
//     //     firm.save().exec()
//     //     .then(() => response.send({
//     //         success : true,
//     //         msg : "release order data saved"
//     //     }))
//     //     .catch(err => console.log(err))
//     // })
//     // .catch(err => {
//     //     console.log(err);
//     //     response.send({
//     //         success : false,
//     //         msg : "cannot save release order data"
//     //     });
//     // });
// }

async function getIDsSan(request, user, firm, rno,response){
    var mediahouseID, clientID, executiveID;

    try {
       var mediahouse = await MediaHouse.find({
            $and: [
                {"Address.edition":request.body.publicationEdition},
                {PublicationName:request.body.publicationName},
                {$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}
            ]
        }).exec();
        console.log(mediahouse);

        if (!mediahouse){
            var media = new MediaHouse({
                OrganizationName:request.body.organizationName,
                PublicationName:request.body.publicationName,
                MediaType:request.body.mediaType,
                Address:request.body.address,
                global:false,
                firm : user.firm
            });

            try {
                mediahouseID = (await media.save().exec())._id;
            }
            catch (err) {
                console.log(err);
            }
        }
        else {
            mediahouseID = mediahouse._id;
        }
    }
    catch (err) {
        console.log("Error in searching for existence of mediahouse.");
        console.log({
            success:false,
            msg: err + ""
        });
    }

    try {
        var client = await Client.find({
            $and: [
                {$or:[
                    {firm:mongoose.mongo.ObjectId(user.firm)},
                    {global:true}
                ]},
                {'CompanyName': request.body.clientName},
                {'Address.state': request.body.clientState}
            ] 
        }).exec();

        if (!client){
           var cli = new Client({
               CompanyName:request.body.clientName,
               firm : user.firm
           });

            try {
                clientID = (await cli.save().exec())._id;
            }
            catch (err) {
                console.log(err);
            }
        }
        else {
            clientID = client._id;
        }
    }
    catch (err) {
        console.log("Error in searching for existence of client.");
        console.log({
            success:false,
            msg: err + ""
        });
    }

    try {
        var executive = await Executive.find({
            $and: [
                {ExecutiveName:request.body.executiveName},
                {OrganizationName:request.body.executiveOrg}
            ]
        }).exec();

        if (!executive){
           var exec = new Executive({
               OrganizationName:request.body.executiveOrg,
               ExecutiveName:request.body.executiveName,
               firm : user.firm
           });

            try {
                executiveID = (await executive.save().exec())._id;
            }
            catch (err) {
                console.log(err);
            }
        }
        else {
            executiveID = executive._id;
        }
    }
    catch (err) {
        console.log("Error in searching for existence of client.");
        console.log({
            success:false,
            msg: err + ""
        });
    }
    console.log({executiveID, mediahouseID, clientID});

    var releaseOrder = new ReleaseOrder({
        date: request.body.date,
        // releaseOrderNO: '20',
        agencyName: firm.FirmName,
        agencyGSTIN: firm.GSTIN,
        agencyPerson: user.name,
        signature: user.signature,
        clientName:request.body.clientName,
        clientGSTIN:request.body.clientGSTIN,
        clientState:request.body.clientState,
        publicationName:request.body.publicationName,
        publicationEdition:request.body.publicationEdition,
        mediaType:request.body.mediaType,
        publicationState:request.body.publicationState,
        publicationGSTIN:request.body.publicationGSTIN,
        adType:request.body.adType,
        rate:request.body.rate,
        unit:request.body.unit,
        adCategory1:request.body.adCategory1,
        adCategory2:request.body.adCategory2,
        adCategory3:request.body.adCategory3,
        adCategory4:request.body.adCategory4,
        adCategory5:request.body.adCategory5,
        adCategory6:request.body.adCategory6,
        adHue:request.body.adHue,
        adSizeL:request.body.adSizeL,
        adSizeW:request.body.adSizeW,
        AdWords:request.body.AdWords,
        AdWordsMax:request.body.AdWordsMax,
        adTime:request.body.adTime,
        AdDuration:request.body.AdDuration,
        adSizeCustom:request.body.adSizeCustom,
        adSizeAmount:request.body.adSizeAmount,
        adTotalSpace:request.body.adTotalSpace,
        adEdition:request.body.adEdition,
        adPosition:request.body.adPosition,
        adSchemePaid:request.body.adSchemePaid,
        adSchemeFree:request.body.adSchemeFree,
        adTotal:request.body.adTotal,
        adGrossAmount:request.body.adGrossAmount,

        PremiumCustom:request.body.PremiumCustom,
        PremiumBox:request.body.PremiumBox,
        PremiumBaseColour:request.body.PremiumBaseColour,
        PremiumEmailId:request.body.PremiumEmailId,
        PremiumCheckMark:request.body.PremiumCheckMark,
        PremiumWebsite:request.body.PremiumWebsite,
        PremiumExtraWords:request.body.PremiumExtraWords,

        publicationDiscount:request.body.publicationDiscount,
        agencyDiscount1:request.body.agencyDiscount1,
        agencyDiscount2:request.body.agencyDiscount2,
        taxAmount:request.body.taxAmount,
        taxIncluded:request.body.taxIncluded,
        netAmountFigures:request.body.netAmountFigures,
        netAmountWords:request.body.netAmountWords,
        caption:request.body.caption,
        remark:request.body.remark,
        paymentType:request.body.paymentType,
        paymentDate:request.body.paymentDate,
        paymentNo:request.body.paymentNo,
        paymentAmount:request.body.paymentAmount,
        paymentBankName:request.body.paymentBankName,
        
        executiveName:request.body.executiveName,
        executiveOrg:request.body.executiveOrg,
        otherCharges:request.body.otherCharges,
        otherRemark:request.body.otherRemark,
        firm:user.firm,
        mediahouseID : mediahouseID,
        clientID: clientID,
        executiveID: executiveID,
        insertions:request.body.insertions,
        // if (taxIncluded){
        //     FinalAmount = (adGrossAmount/(100+taxAmount))*100;
        //     FinalTaxAmount = (adGrossAmount/(100+taxAmount))*taxAmount
        // }
    });

    await releaseOrder.save()
    .then(() => { 
        firm.ROSerial += 1;
        firm.save()
        .then(() => response.send({
            success : true,
            msg : "release order data saved"
        }))
        .catch(err => console.log(err))
    })
    .catch(err => {
        console.log(err);
        response.send({
            success : false,
            msg : "cannot save release order data"
        });
    });
}

module.exports.getReleaseOrder = function(request,response){
     
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
            
            ReleaseOrder.findById(request.params.id,function(err, releaseOrder){
                
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
                        releaseOrder : releaseOrder
                    }); 
                }
            });
			
		}
	});	
};
module.exports.getReleaseOrders = function(request, response){
     
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log(err);
			response.send({
				success:false,
				msg: err +""
			});
		}
		else{
            console.log(user.firm);
            ReleaseOrder.find({firm:user.firm},function(err, releaseOrders){
                if(err){
                    console.log("here");
                    response.send({
                        success:false,
                        msg: err + ""
                    });
                }
                else if(!releaseOrders){
                    console.log("No releaseorder");
                    response.send({
                        success:false,
                        msg:" No release Order"
                    });
                }
                else{
                    console.log(releaseOrders)
                    response.send({
                        success : true,
                        releaseOrders : releaseOrders
                    });
                }
            });
		}
	});	

};


module.exports.queryReleaseOrder = function(request, response){

    var mediahouseID =(request.body.mediahouseID)?(request.body.mediahouseID):null;
    var clientID = (request.body.clientID)?(request.body.clientID):null;
    var executiveID = (request.body.executiveID)?(request.body.executiveID):null;
    var date = (request.body.date)?(request.body.date):null;
    var adCategory1 = request.body.adCategory1;
    var adCategory2 = request.body.adCategory2;
    
    ReleaseOrder.find().or([{date:date},{'adCategory1':{ $ifnull : [{adCategory1, $regex:""}]}},{'adCategory2':{ $ifnull : [{adCategory2, $regex:""}]}}, {$and:[{mediahouseID: {$ifnull : [{mediahouseID, $regex:""}]}}, {clientID: {$ifnull : [{clientID, $regex:""}]}},{executiveID: {$ifnull : [{executiveID, $regex:""}]}}]}])
    .exec(function(err, releaseOrders){
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
                releaseOrders: releaseOrders
            });
        }
    });
    
};

module.exports.deleteReleaseOrder = function(request, response){
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
            ReleaseOrder.findByIdAndRemove(request.params.id,function(err){
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
                        msg: "Release Order deleted"
                    });
                }
                
            })
		}	
	});
};

module.exports.updateReleaseOrder = function(request, response){
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
            ReleaseOrder.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, releaseOrder){
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
                        msg: "ReleaseOrder Updated"
                    });
                }
                
            })
		}	
	});
};


module.exports.generateROPdf = function(request, response) {
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
        else {
            ReleaseOrder.findById(request.body.id, function(err, releaseOrder){
                if(err){
                    console.log(err);
                    response.send({
                        success :false,
                        msg: err 
                    })
                }
                else if(!releaseOrder){
                    response.send({
                        success :false,
                        msg: 'Release order not found' 
                    })
                }
                else{
                    var Details = {
                        publisher :releaseOrder.publicationName,
                        pgstin :releaseOrder.publicationGSTIN.GSTNo,
                        cname :releaseOrder.clientName,
                        cgstin :releaseOrder.clientGSTIN.GSTNo,
                        rno :releaseOrder.releaseOrderNo,
                        date :releaseOrder.date,
                        gstin :releaseOrder.agencyGSTIN,
                        Scheme :releaseOrder.adSchemePaid+'-'+releaseOrder.adSchemeFree,
                        gamount :releaseOrder.adGrossAmount,
                        
                    }
                }
            })
        }
    });
}
