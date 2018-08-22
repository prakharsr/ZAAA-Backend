var config = require('../../config');
var RateCard = require('../models/Ratecard');
var userController = require('./userController');
var firmController = require('./firmController');
var pdf = require('./pdf');
var User = require('../models/User');
var ReleaseOrder = require('../models/ReleaseOrder');
var jwt = require('jsonwebtoken');
var Firm = require('../models/Firm');
var Plan = require('../models/Plan');
var MediaHouse = require('../models/MediaHouse');
var Category = require('../../admin/models/Categories');
var Executive = require('../models/Executive');
var Client = require('../models/Client');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;
var http = require('http');

var XLSX = require('xlsx');
var base64 = require('base64-stream');
var stream = require('stream');


function getExecutiveID(request, response, user){
    return new Promise((resolve, reject) => {
        Executive.find({$and: [
            {'ExecutiveName':request.body.executiveName},
            {'OrganizationName':request.body.executiveOrg}
        ]}).exec(function(err, executive){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (executive.length===0)
            {
                var newExecutive = new Executive({
                    OrganizationName:request.body.executiveOrg,
                    ExecutiveName:request.body.executiveName,
                    firm : user.firm
                });
                newExecutive.save(function(err, doc){
                    executiveID = newExecutive._id;
                    resolve(executiveID);
                })
            }
            if(executive.length!==0){
                executiveID =  executive[0]._id;
                resolve(executiveID);
            }
        })
    })
}

function getClientID(request, response, user){
    return new Promise((resolve, reject) => {
        Client.find(
            {$and: [
                {$or:[
                    {firm:mongoose.mongo.ObjectId(user.firm)},
                    {global:true}
                ]},
                {'OrganizationName': request.body.clientName},
                {'Address.state': request.body.clientState}
            ]}
        ).exec(function(err, client){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (client.length===0)
            {
                var newClient = new Client({
                    OrganizationName:request.body.clientName,
                    firm : user.firm,
                    "Address.state" : request.body.clientState,
                    GSTIN : request.body.clientGSTIN
                });
                newClient.save(function(err, doc){
                    if(err)
                    {
                        console.log(err)
                    }
                    clientID = newClient._id;
                    
                    resolve(clientID);
                })
            }
            if(client.length!==0){
                clientID =  client[0]._id;
                resolve(clientID);
            }
        });
    });
}
function getMediahouseID(request, response, user){
    return new Promise((resolve, reject) => {
        MediaHouse.find({$and: [
            {"Address.edition":request.body.publicationEdition},
            {PublicationName:request.body.publicationName},
            {$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}
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
                console.log(request.body)
                var newMediahouse = new MediaHouse({
                    OrganizationName:request.body.organizationName,
                    PublicationName:request.body.publicationName,
                    'Address.edition':request.body.publicationEdition,
                    MediaType:request.body.mediaType,
                    'Address.state':request.body.publicationState,
                    GSTIN:request.body.publicationGSTIN,
                    global:false,
                    pullouts:[{Name:request.body.pulloutName,Frequency:"Daily",Language:"",Remark:""}],
                    firm : user.firm
                });
                
                newMediahouse.save(function(err, doc){
                    console.log('mediahouse saved');
                    mediahouseID = newMediahouse._id;
                    resolve(mediahouseID)
                })
            }
            if(mediahouse.length!==0){
                console.log("mediahouse found");
                mediahouseID =  mediahouse[0]._id;
                resolve(mediahouseID)
            }
        });
    })
}



async function f (request, response, user){
    var firm = response.locals.firm;
    var mediahouseID = await getMediahouseID(request, response, user);
    var clientID = await getClientID(request, response, user);
    var executiveID = await getExecutiveID(request, response, user);
    var date = new Date()
    var sn = firm.ROSerial+1;
    var fname = firm.FirmName;
    var shortname = fname.match(/\b\w/g).join('');
    var city = firm.OfficeAddress.city;
    var gstin = firm.GSTIN;
    gstin = gstin.GSTNo.substring(0,1);
    var year = date.getFullYear();
    var rno = year+''+gstin+''+shortname+''+city+''+sn;
    console.log(rno);
    
    var releaseOrder = new ReleaseOrder({
        
        releaseOrderNO: rno,
        agencyName: firm.FirmName,
        agencyGSTIN: firm.GSTIN,
        agencyPerson: user.name,
        agencyState:firm.OfficeAddress.state,
        signature: user.signature,
        clientName:request.body.clientName,
        clientGSTIN:request.body.clientGSTIN,
        clientState:request.body.clientState,
        publicationName:request.body.publicationName,
        publicationEdition:request.body.publicationEdition,
        mediaType:request.body.mediaType,
        publicationState:request.body.publicationState,
        publicationGSTIN:request.body.publicationGSTIN,
        pulloutName: request.body.pulloutName,
        adType:request.body.adType,
        rate:request.body.rate,
        fixRate: request.body.fixRate,
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
        AdTime:request.body.AdTime,
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
        insertions: request.body.insertions.map(function(insertion) {
            return {
                ...insertion,
                _id: undefined
            }
        }),
        executiveName:request.body.executiveName,
        executiveOrg:request.body.executiveOrg,
        otherCharges:request.body.otherCharges,
        otherRemark:request.body.otherRemark,
        template: firm.ROTemplate,
        firm:user.firm,
        mediahouseID : mediahouseID,
        clientID: clientID,
        executiveID: executiveID,
    });
    
    releaseOrder.save( function(err, doc){
        if(err)
        {
            response.send({
                success:false,
                msg: err.message
            });
        }
        else{
            firm.ROSerial += 1;
            firm.save(function(err){
                if(err){
                    response.send({
                        success:false,
                        msg: err.message
                    });
                }
                else{
                    response.send({
                        success : true,
                        msg : doc._id
                    });
                }
            });
        }
    })
};

module.exports.createRO = function(request, response){
    f(request, response, response.locals.user)
};

module.exports.getReleaseOrder = function(request,response){
    
    var user = response.locals.user;
    ReleaseOrder.findById(request.params.id,async function(err, releaseOrder){
        if(err){
            console.log("here" +err);
            response.send({
                success:false,
                msg: err+"",
            });
        }
        else{
            try{
                var mediahouse = await MediaHouse.findById(releaseOrder.mediahouseID);
                var executive = await Executive.findById(releaseOrder.executiveID);
                var client = await Client.findById(releaseOrder.clientID);
                response.send({
                    mediahouse: mediahouse,
                    client: client,
                    executive: executive,
                    success : true,
                    releaseOrder : releaseOrder
                }); 
            }
            catch(err){
                response.send({
                    success: false,
                    msg: "Can't fetch releaseOrder"
                });
            }
        }
    });
};

module.exports.getReleaseOrders = function(request, response){
    
    var user = response.locals.user;
    ReleaseOrder.find({"firm":user.firm})
    .limit(perPage)
    .skip((perPage*request.params.page) - perPage)
    .sort(-'date')
    .exec(function(err, releaseOrders){
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
            ReleaseOrder.count({}, function(err, count){
                response.send({
                    success : true,
                    releaseOrders : releaseOrders,
                    perPage:perPage,
                    page: request.params.page,
                    pageCount : Math.ceil(count/perPage)
                    
                });
            })
        }
    });
};

module.exports.getReleaseOrderInsertions = function(request, response){
    
    var user = response.locals.user;
    ReleaseOrder
    .aggregate([{$unwind: "$insertions"}, 
    {$match:{firm:user.firm}, generated:true },
    {$project: {
        "_id":1,
        "publicationName":1,
        "publicationEdition":1, 
        "clientName":1,
        "releaseOrderNO":1,
        "insertions.date": 1,
        "insertions.marked": 1,
        "insertions.state": 1,
        "insertions.ISODate": 1, 
        "insertions._id": 1,
        "executiveName":1,
        "executiveOrg":1,
    }
},
{$limit: perPage},
{$skip:(perPage * request.params.page) - perPage}
])
.exec(function(err, insertions){
    if(err){
        console.log("here");
        response.send({
            success:false,
            msg: err + ""
        });
    }
    else if(!insertions){
        console.log("No insertions");
        response.send({
            success:false,
            msg:" No insertions"
        });
    }
    else{
        ReleaseOrder.count({}, function(err, count){    
            response.send({
                success : true,
                insertions : insertions,
                perPage:perPage,
                page: request.params.page,
                pageCount : Math.ceil(count/perPage)
                
            });
        })
    }
});
};
module.exports.setInsertionChecks = function(request, response){
	var user = response.locals.user;
    ReleaseOrder.updateMany(
        { $and: [{firm:user.firm}, {"insertions._id":{$in:request.body.ids}}]
    },
    { $set: { "insertions.$.state": request.body.state }}
)
.exec(function(err){
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
            msg: "ReleaseOrder Insertions Updated"
        });
    }
    
})
};

function searchExecutiveID(request, response, user){
    return new Promise((resolve, reject) => {
        Executive.find({$and: [
            {'ExecutiveName':request.body.executiveName},
            {'OrganizationName':request.body.executiveOrg}
        ]}).exec(function(err, executive){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (executive.length===0)
            {
                resolve(null);
                
            }
            if(executive.length!==0){
                executiveID =  executive[0]._id;
                resolve(executiveID);
            }
        })
    })
}

function searchClientID(request, response, user){
    return new Promise((resolve, reject) => {
        Client.find(
            {$and: [
                {$or:[
                    {firm:mongoose.mongo.ObjectId(user.firm)},
                    {global:true}
                ]},
                {'OrganizationName': request.body.clientName},
                {'Address.state': request.body.clientState}
            ]}
        ).exec(function(err, client){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (client.length===0)
            {
                
                resolve(null);
                
            }
            if(client.length!==0){
                clientID =  client[0]._id;
                resolve(clientID);
            }
        });
    });
}
function searchMediahouseID(request, response, user){
    return new Promise((resolve, reject) => {
        MediaHouse.find({$and: [
            {'PublicationName':request.body.publicationName},
            {"Address.edition":request.body.publicationEdition},
            {$or:[{'firm':mongoose.mongo.ObjectId(user.firm)},{global:true}]}
        ]}).exec( function(err, mediahouse){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (mediahouse.length == 0)
            {
                resolve(null)
            }
            if(mediahouse.length!==0){
                console.log("mediahouse found");
                mediahouseID =  mediahouse[0]._id;
                resolve(mediahouseID)
            }
        });
    })
}

function formQuery(mediahouseID, clientID, executiveID, date, user, request){
    return new Promise((resolve, reject) => {
        var query = {'firm':user.firm};
        if(mediahouseID)
        query['mediahouseID']=mongoose.mongo.ObjectId(mediahouseID);
        if(clientID)
        query['clientID'] = mongoose.mongo.ObjectId(clientID);
        if(executiveID)
        query['executiveID']=mongoose.mongo.ObjectId(executiveID);
        if(request.body.creationPeriod)
        {
            var to = new Date()
            var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
            query['date']={$gte: from, $lte:to} 
        }
        
        if(request.body.insertionPeriod )
        {
            var to = new Date()
            var from = new Date( to.getTime()- request.body.insertionPeriod *24*60*60*1000);
            query['insertions.ISODate']={$gte: from, $lte:to} 
            
        }
        if(request.body.releaseOrderNO){
            query['releaseOrderNO'] = request.body.releaseOrderNO;
        }
        if(request.body.generated !== undefined)
        query['generated'] = request.body.generated == true;
        if(request.body.marked)
        query['insertions.marked'] = false;
        
        console.log(query);
        resolve(query);
        
    })
    
    
}

module.exports.queryReleaseOrder = async function(request, response){
	var user = response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var executiveID = await searchExecutiveID(request, response, user);
    var date = (request.body.date)?(request.body.date):null;
    var adCategory1 = request.body.adCategory1;
    var adCategory2 = request.body.adCategory2;
    
    var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request);
    
    
    ReleaseOrder.find(query)
    .limit(perPage)
    .skip((perPage * request.body.page) - perPage)
    .exec(function(err, releaseOrders){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            ReleaseOrder.count(query, function(err, count){
                console.log(releaseOrders, count)
                response.send({
                    success:true,
                    releaseOrders: releaseOrders,
                    page: request.body.page,
                    perPage:perPage,
                    pageCount: Math.ceil(count/perPage)
                });
            })
            
        }
    });
};
module.exports.queryGenerated = function(request, response){
    var user = response.locals.user;
    ReleaseOrder
    .findById(mongoose.mongo.ObjectId(request.body.id))
    .exec(function(err, releaseOrder){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            releaseOrder.generated = true;
            var date = new Date();
            releaseOrder.generatedAt = date;
            releaseOrder.save(function(err){
                if(err){
                    response.send({
                        success:false
                    })
                }
                else{
                    response.send({
                        success:true
                    })
                }
            })
        }
    });
};
module.exports.queryInsertions =async function(request, response){
    var user = response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var executiveID = await searchExecutiveID(request, response, user);
    var date = (request.body.date)?(request.body.date):null;
    var adCategory1 = request.body.adCategory1;
    var adCategory2 = request.body.adCategory2;
    var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request);
    
    
    ReleaseOrder
    .aggregate([{$unwind: "$insertions"}, 
    {$match:query },
    {$project: {
        "_id":1,
        "publicationName":1,
        "publicationEdition":1, 
        "clientName":1,
        "releaseOrderNO":1,
        "insertions.date": 1, 
        "insertions.marked": 1,
        "insertions.state": 1,
        "insertions.ISODate": 1, 
        "insertions._id": 1,
        "executiveName":1,
        "executiveOrg":1,
    }
},
{$limit: perPage},
{$skip:(perPage * request.body.page) - perPage}
])
.exec(function(err, insertions){
    if(err){
        console.log(err+ "");
        response.send({
            success:false,
            msg: err +""
        });
    }
    else{
        ReleaseOrder.count(query, function(err, count){
            console.log(insertions, count)
            response.send({
                success:true,
                insertions: insertions,
                page: request.body.page,
                perPage:perPage,
                pageCount: Math.ceil(count/perPage)
            });
        })
        
    }
});
}

module.exports.generateInsertionsSheet =async function(request, response){
    var user = response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var executiveID = await searchExecutiveID(request, response, user);
    var date = (request.body.date)?(request.body.date):null;
    var adCategory1 = request.body.adCategory1;
    var adCategory2 = request.body.adCategory2;
    var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request);
    
    
    ReleaseOrder
    .aggregate([{$unwind: "$insertions"}, 
    {$match:query },
    {$project: {
        "_id":1,
        "publicationName":1,
        "releaseOrderNO":1,
        "publicationEdition":1, 
        "clientName":1,
        "insertions.date": 1, 
        "insertions.marked": 1,
        "insertions.state": 1,
        "insertions.ISODate": 1, 
        "insertions._id": 1,
        "executiveName":1,
        "executiveOrg":1,
        "insertions.generated":1,
        "insertions.state":1,
        "adType":1,
        "adEdition":1,
        "adPosition":1,
        "adCategory1":1,
        "caption":1,
    }
}
])
.exec(function(err, insertions){
    if(err){
        console.log(err+ "");
        response.send({
            success:false,
            msg: err +""
        });
    }
    else{
        console.log(insertions)
        var el = insertions.map(function(insertion){
            var obj = {
                "RO Number": insertion.releaseOrderNO,
                "Insertion":insertion.insertions.ISODate.toLocaleDateString(),
                "Client Name": insertion.clientName,
                "Mediahouse Name": insertion.publicationName,
                "Edition": insertion.publicationEdition,
                "Ad Type":insertion.adType,
                "Published Edition":insertion.adEdition,
                "Position":insertion.adPosition,
                "Caption":insertion.caption,
                "Category":insertion.adCategory1,
                "Invoice created":insertion.insertions.marked,
            }
            if(insertion.insertions.state ==0)
            obj["Status"] = "To be Published";
            if(insertion.insertions.state ==1)
            obj["Status"] = "Published";
            if(insertion.insertions.state ==2)
            obj["Status"] = "Disputed";
            return obj;
        })
        createSheet(el, request, response, 'Insertions Report', 'insertions Report');
    }
});
}



module.exports.deleteReleaseOrder = function(request, response){
	var user = response.locals.user;
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
};

module.exports.cancelReleaseOrder = function(request, response){
    var user = response.locals.user;
    ReleaseOrder.findById(mongoose.mongo.ObjectId(request.body.id))
    .exec(function(err, releaseOrder){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            if (releaseOrder.insertions.some(insertion => insertion.marked)
            || releaseOrder.mediahouseInvoices.length > 0) {
                response.send({
                    success:false,
                    msg: "Can not cancel ReleaseOrder"
                });
            }
            else{
                releaseOrder.cancelled = true;
                releaseOrder.save(function(err){
                    if(err)
                    {
                        console.log(err)
                    }
                    else{
                        response.send({
                            success:true,
                            msg: "ReleaseOrder Cancelled"
                        });
                    }
                });
            }
        }
        
    })
};

module.exports.updateReleaseOrder = function(request, response){
    var user = response.locals.user;
    
    delete request.body.createdAt;
    delete request.body.updatedAt;

    console.log(request.body);
    
    ReleaseOrder.findByIdAndUpdate(mongoose.mongo.ObjectId(request.body.id), {
        $set: request.body
    }, function(err, releaseOrder){
        if(err){
            console.log(err);
            response.send({
                success:false,
                msg: err + ""
            });
        }
        else{
            releaseOrder.save(function(err){
                if(err)
                {
                    console.log(err)
                }
                else{
                    response.send({
                        success:true,
                        msg: "ReleaseOrder Updated"
                    });
                }
            });   
        }
    })
};


module.exports.mailROPdf = function(request, response) {
    var user = response.locals.user;
    ReleaseOrder.findById(request.body.id, async function(err, releaseOrder){
        if(err){
            console.log(err);
            response.send({
                success :false,
                msg: err 
            });
        }
        else if(!releaseOrder){
            response.send({
                success :false,
                msg: 'Release order not found' 
            });
        }
        else{
            var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
            if (releaseOrder.generated==false){
                releaseOrder.generated=true;
                var date = new Date();
                releaseOrder.generatedAt = date;
            }
            releaseOrder.save(async function(err){
                if(err)
                response.send({
                    success:false,
                    msg: err
                });
                else{
                    var result = doc.insertions.reduce((grouped, item) => {
                        var index = grouped.findIndex(m => m.key.month == item.date.month
                            && m.key.year == item.date.year);
                            
                        if (index == -1) {
                            grouped.push({ key: { month: item.date.month, year: item.date.year }, items: [item] });
                        }
                        else grouped[index].items.push(item);
                        
                        return grouped;
                    }, []);

                    console.log(result);
                    var releaseOrder = doc;
                    var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
                    var insData="";
                    var insertions = releaseOrder.insertions;
                    var size = releaseOrder.adSizeL * releaseOrder.adSizeW;
                    var damount = (releaseOrder.publicationDiscount+releaseOrder.agencyDiscount1+releaseOrder.agencyDiscount2)*releaseOrder.adGrossAmount;
                    var namount = releaseOrder.adGrossAmount - damount ;
                    result.forEach(object =>{
                        var dates = "";
                        object.items.forEach(obj => {dates += obj.date.day+" "});
                        insData+='<tr><td>'+'<<Description>>'+'</td><td>'+releaseOrder.publicationEdition+'</td><td>'+object.key.month+'-'+object.key.year+'<br>Dates: '+dates+'</td><td>'+releaseOrder.adPosition+'</td><td>'+releaseOrder.adSizeL+'x'+releaseOrder.adSizeW+'</td><td>'+size+'</td><td>'+releaseOrder.rate+'</td></tr>';
                    });
                    var Details = {
                        image : config.domain+'/'+firm.LogoURL,
                        mediahouse :releaseOrder.publicationName,
                        pgstin :'-',
                        cname :releaseOrder.clientName,
                        cgstin :'-',
                        gstin :'-',
                        scheme :releaseOrder.adSchemePaid+'-'+releaseOrder.adSchemeFree,
                        gamount :releaseOrder.adGrossAmount,
                        insertions :insData,
                        dper :releaseOrder.publicationDiscount+'+'+releaseOrder.agencyDiscount1+'+'+releaseOrder.agencyDiscount2,
                        damount :damount,
                        namount :namount,
                        username: user.name,
                        firmname: firm.FirmName,
                        rno : releaseOrder.releaseOrderNO,
                        logo: firm.LogoURL,
                        sign: config.domain+'/'+user.signature
                    }
                    console.log(releaseOrder.agencyGSTIN)

                    if(releaseOrder.agencyGSTIN.GSTType !== 'URD')
                        Details['gstin'] =releaseOrder.agencyGSTIN.GSTNo
                    if(releaseOrder.publicationGSTIN.GSTType !== 'URD')
                        Details['pgstin'] =releaseOrder.publicationGSTIN.GSTNo
                    if(releaseOrder.clientGSTIN.GSTType !== 'URD')
                        Details['cgstin'] =releaseOrder.clientGSTIN.GSTNo
   
                    
                    pdf.generateReleaseOrder(request,response,Details);
                }
            })
            
        }
    })
}

module.exports.generateROPdf = async function(request, response) {
    var user = response.locals.user;
    var firm = response.locals.firm;
    console.log(request.body);
    ReleaseOrder.findById(request.body.id, async function(err, releaseOrder){
        if(err){
            console.log(err);
            response.send({
                success :false,
                msg: err 
            });
        }
        else if(!releaseOrder){
            response.send({
                success :false,
                msg: 'Release order not found' 
            });
        }
        else{
            if (releaseOrder.generated==false){
                releaseOrder.generated=true;
                var date = new Date();
                releaseOrder.generatedAt = date;
            }
            releaseOrder.save(async function(err,doc){
                if(err)
                response.send({
                    success:false,
                    msg: err
                })
                else{
                    var result = releaseOrder.insertions.reduce((grouped, item) => {
                        var index = grouped.findIndex(m => m.key.month == item.date.month
                            && m.key.year == item.date.year);
                            
                        if (index == -1) {
                            grouped.push({ key: { month: item.date.month, year: item.date.year }, items: [item] });
                        }
                        else grouped[index].items.push(item);
                        
                        return grouped;
                    }, []);

                    console.log(result);
                    var insertions = releaseOrder.insertions;
                    var size = releaseOrder.adSizeL * releaseOrder.adSizeW;
                    var damount = (releaseOrder.publicationDiscount+releaseOrder.agencyDiscount1+releaseOrder.agencyDiscount2)*releaseOrder.adGrossAmount;
                    var namount = releaseOrder.adGrossAmount - damount;
                    var caption = releaseOrder.caption?releaseOrder.caption:"-";
                    //var categories = (releaseOrder.adCategory1?(releaseOrder.adCategory2?(releaseOrder.adCategory3?(releaseOrder.adCategory4?(releaseOrder.adCategory5?(releaseOrder.adCategory6?releaseOrder.adCategory1+'-'+releaseOrder.adCategory2+'-'+releaseOrder.adCategory3+'-'+releaseOrder.adCategory4+'-'+releaseOrder.adCategory5+'-'+releaseOrder.adCategory6:releaseOrder.adCategory1+'-'+releaseOrder.adCategory2+'-'+releaseOrder.adCategory3+'-'+releaseOrder.adCategory4+'-'+releaseOrder.adCategory5):releaseOrder.adCategory1+'-'+releaseOrder.adCategory2+'-'+releaseOrder.adCategory3+'-'+releaseOrder.adCategory4):releaseOrder.adCategory1+'-'+releaseOrder.adCategory2+'-'+releaseOrder.adCategory3):releaseOrder.adCategory1+'-'+releaseOrder.adCategory2):releaseOrder.adCategory1):"-")
                    var catarray = [releaseOrder.adCategory2, releaseOrder.adCategory3, releaseOrder.adCategory4, releaseOrder.adCategory5, releaseOrder.adCategory6];
                    var categories = releaseOrder.adCategory1 || '-';
                    var premam = 0;
                    var premium = '';
                    
                    if(releaseOrder.PremiumBox.Included){
                        premam += releaseOrder.PremiumBox.Amount;
                        premium += "Premium Box ";
                    }

                    if(releaseOrder.PremiumBaseColour.Included){
                        premam += releaseOrder.PremiumBaseColour.Amount;
                        premium += "Premium Base Colour ";
                    }

                    if(releaseOrder.PremiumEmailId.Included){
                        premam += releaseOrder.PremiumEmailId.Amount*releaseOrder.PremiumBaseColour.Quantity;
                        premium += "Premium Email Id ";
                    }

                    if(releaseOrder.PremiumCheckMark.Included){
                        premam += releaseOrder.PremiumCheckMark.Amount;
                        premium += "Premium Check Mark ";
                    }

                    if(releaseOrder.PremiumWebsite.included){
                        premam += releaseOrder.PremiumBox.Amount*releaseOrder.PremiumBaseColour.Quantity;
                        premium += "Premium website ";
                    }

                    if(releaseOrder.PremiumExtraWords.included){
                        premam += releaseOrder.PremiumExtraWords.Amount*releaseOrder.PremiumBaseColour.Quantity;
                        premium += "Premium Extra Words ";
                    }
                    
                    catarray.forEach(element => {
                        if (element) {
                            categories += ' - ' + element;
                        }
                    });
                    var insData = '';
                    var count = 0;
                    result.forEach(object =>{
                        var dates = "";
                        object.items.forEach(obj => {dates += obj.date.day+" "});
                        if(count === 0){
                            insData += '<tr><td colspan="2">'+caption+'<br>'+categories+'<br>'+premium+'</td><td>'+toMonth(object.key.month)+'-'+object.key.year+'<br>Dates: '+dates+'</td><td>'+releaseOrder.adPosition+'</td><td>'+releaseOrder.adSizeL+'x'+releaseOrder.adSizeW+'</td><td>'+size+'</td><td>'+releaseOrder.adGrossAmount+'</td></tr>';
                            count = 1;
                        }
                        else{
                            insData+='<tr><td colspan="2">'+caption+'<br>'+categories+'<br>'+premium+'</td><td>'+toMonth(object.key.month)+'-'+object.key.year+'<br>Dates: '+dates+'</td><td>'+releaseOrder.adPosition+'</td><td>'+releaseOrder.adSizeL+'x'+releaseOrder.adSizeW+'</td><td>'+size+'</td><td>'+'</td></tr>';
                        }
                    });

                    var remark = "2. "+releaseOrder.remark;

                    var paymentDetails="";
                    var address = firm.RegisteredAddress;
                    var caddress = releaseOrder.clientState;
                    var maddress = releaseOrder.publicationState;


                    if(releaseOrder.paymentType === 'Cash')
                    paymentDetails = "Cash"
                    else if(releaseOrder.paymentType === 'Credit')
                    paymentDetails = "Credit"
                    else if(releaseOrder.paymentType === 'Cheque')
                    paymentDetails = "Cheque of "+releaseOrder.paymentBankName+" Dated "+releaseOrder.paymentDate+" Numbered "+releaseOrder.paymentNo
                    else if(releaseOrder.paymentType === 'NEFT')
                    paymentDetails = "NEFT TransactionID: "+releaseOrder.paymentNo;

                    var Details = {
                        image : config.domain+'/'+firm.LogoURL,
                        mediahouse :releaseOrder.publicationName,
                        pgstin :releaseOrder.publicationGSTIN.GSTNo,
                        cname :releaseOrder.clientName,
                        cgstin :'-',
                        gstin :'-',
                        scheme :releaseOrder.adSchemePaid+'+'+releaseOrder.adSchemeFree,
                        insertions :insData,
                        username: user.name,
                        firmname: firm.FirmName,
                        rno : releaseOrder.releaseOrderNO,
                        sign: config.domain+'/'+user.signature,
                        remark: releaseOrder.Remark || "",
                        jurisdiction: firm.jurisdiction ? firm.jurisdiction : address.city,
                        paymentDetails: paymentDetails,
                        namount: '',
                        namountwords: '',
                        gstamount: '',
                        sgstamount: '-',
                        cgstamount: '-',
                        igstamount: '-',
                        igst: '-',
                        cgst: '-',
                        sgst: '-',
                        taxamount: '',
                        publicationdisc: '',
                        damount1: '',
                        damount2:'',
                        agenD1: releaseOrder.agencyDiscount1,
                        agenD2: releaseOrder.agencyDiscount2,
                        pubD: releaseOrder.publicationDiscount,
                        edition: releaseOrder.adEdition,
                        adtype:releaseOrder.adType,
                        hue:releaseOrder.adHue,
                        address: address?(address.address+'<br>'+address.city+"<br>"+address.state+'<br>PIN code:'+address.pincode):'',
                        caddress: caddress || '',
                        maddress: maddress || '',
                        pullout: releaseOrder.pulloutName,
                        premam : premam,
                        remark: remark
                    }

                    if(releaseOrder.adSchemeFree === 0);
                    Details['scheme'] = 'NA';

                    var adGrossAmount;
                    var tax = releaseOrder.taxAmount.primary;
                    if(releaseOrder.taxIncluded){
                        adGrossAmount = (releaseOrder.adGrossAmount/(100 + tax))*100;
                    }
                    else{
                        adGrossAmount = releaseOrder.adGrossAmount;
                    }

                    publicationDisc = adGrossAmount*releaseOrder.publicationDiscount/100;
                    damount1 = (adGrossAmount - publicationDisc)*(+releaseOrder.agencyDiscount1)/100;
                    damount2 = (adGrossAmount - damount1 - publicationDisc)*(+releaseOrder.agencyDiscount2)/100;
                    Details['damount2'] = damount2;
                    Details['damount1'] = damount1;
                    Details['publicationdisc'] = publicationDisc;
                    var taxamount = releaseOrder.netAmountFigures;
                    Details['taxamount'] = taxamount;
                    Details['namount'] = taxamount + (taxamount*tax)/100;
                    Details['namountwords'] = amountToWords(Math.ceil(taxamount + (taxamount*tax)/100));

                    if(firm.GSTIN.GSTType !== 'URD')
                        Details['gstin'] =firm.GSTIN.GSTNo;
                    if(releaseOrder.clientGSTIN.GSTType !== 'URD')
                        Details['cgstin'] =releaseOrder.clientGSTIN.GSTNo;
                    
                    Details['gstamount'] = taxamount*tax/100;
                    
                    if(releaseOrder.publicationState === releaseOrder.clientState){
                        Details['sgst'] = Details['cgst'] = tax/2;
                        Details['sgstamount'] = Details['cgstamount'] = (taxamount*tax/2)/100; 

                    }
                    else{
                        Details['igst'] = tax;
                        Details['igstamount'] = (taxamount*tax)/100;
                    }

                    
                    pdf.generateReleaseOrder(request,response,Details);
                }
            })
        }
    });
}

module.exports.previewROhtml = async function(request, response) {
    var user = response.locals.user;
    var firm = response.locals.firm;
    var doc = request.body.releaseOrder;
    var result = doc.insertions.reduce((grouped, item) => {
        var index = grouped.findIndex(m => m.key.month == item.date.month
            && m.key.year == item.date.year);
            
        if (index == -1) {
            grouped.push({ key: { month: item.date.month, year: item.date.year }, items: [item] });
        }
        else grouped[index].items.push(item);
        
        return grouped;
    }, []);

    console.log(result);
    var releaseOrder = doc;
    if(releaseOrder.mediahouse)
    // var mediahouse = await MediaHouse.findById(mongoose.mongo.ObjectId(releaseOrder.mediahouseID));
    // var client = await Client.findById(mongoose.mongo.ObjectId(releaseOrder.clientID));
    var insertions = releaseOrder.insertions;
    var size = releaseOrder.adSizeL * releaseOrder.adSizeW;
    var damount = (releaseOrder.publicationDiscount+releaseOrder.agencyDiscount1+releaseOrder.agencyDiscount2)*releaseOrder.adGrossAmount;
    var namount = releaseOrder.adGrossAmount - damount;
    var caption = releaseOrder.caption?releaseOrder.caption:"-";
    //var categories = (releaseOrder.adCategory1?(releaseOrder.adCategory2?(releaseOrder.adCategory3?(releaseOrder.adCategory4?(releaseOrder.adCategory5?(releaseOrder.adCategory6?releaseOrder.adCategory1+'-'+releaseOrder.adCategory2+'-'+releaseOrder.adCategory3+'-'+releaseOrder.adCategory4+'-'+releaseOrder.adCategory5+'-'+releaseOrder.adCategory6:releaseOrder.adCategory1+'-'+releaseOrder.adCategory2+'-'+releaseOrder.adCategory3+'-'+releaseOrder.adCategory4+'-'+releaseOrder.adCategory5):releaseOrder.adCategory1+'-'+releaseOrder.adCategory2+'-'+releaseOrder.adCategory3+'-'+releaseOrder.adCategory4):releaseOrder.adCategory1+'-'+releaseOrder.adCategory2+'-'+releaseOrder.adCategory3):releaseOrder.adCategory1+'-'+releaseOrder.adCategory2):releaseOrder.adCategory1):"-")
    var catarray = [releaseOrder.adCategory2, releaseOrder.adCategory3, releaseOrder.adCategory4, releaseOrder.adCategory5, releaseOrder.adCategory6];
    var categories = releaseOrder.adCategory1 || '-';
    var premam = 0;
    var premium = '';
    
    if(releaseOrder.PremiumBox.Included){
        premam += releaseOrder.PremiumBox.Amount;
        premium += "Premium Box ";
    }

    if(releaseOrder.PremiumBaseColour.Included){
        premam += releaseOrder.PremiumBaseColour.Amount;
        premium += "Premium Base Colour ";
    }

    if(releaseOrder.PremiumEmailId.Included){
        premam += releaseOrder.PremiumEmailId.Amount*releaseOrder.PremiumBaseColour.Quantity;
        premium += "Premium Email Id ";
    }

    if(releaseOrder.PremiumCheckMark.Included){
        premam += releaseOrder.PremiumCheckMark.Amount;
        premium += "Premium Check Mark ";
    }

    if(releaseOrder.PremiumWebsite.included){
        premam += releaseOrder.PremiumBox.Amount*releaseOrder.PremiumBaseColour.Quantity;
        premium += "Premium website ";
    }

    if(releaseOrder.PremiumExtraWords.included){
        premam += releaseOrder.PremiumExtraWords.Amount*releaseOrder.PremiumBaseColour.Quantity;
        premium += "Premium Extra Words ";
    }
    
    catarray.forEach(element => {
        if (element) {
            categories += ' - ' + element;
        }
    });
    var insData = '';
    var count = 0;
    result.forEach(object =>{
        var dates = "";
        object.items.forEach(obj => {dates += obj.date.day+" "});
        if(count === 0){
            insData += '<tr><td colspan="2">'+caption+'<br>'+categories+'<br>'+premium+'</td><td>'+toMonth(object.key.month)+'-'+object.key.year+'<br>Dates: '+dates+'</td><td>'+releaseOrder.adPosition+'</td><td>'+releaseOrder.adSizeL+'x'+releaseOrder.adSizeW+'</td><td>'+size+'</td><td>'+releaseOrder.adGrossAmount+'</td></tr>';
            count = 1;
        }
        else{
            insData+='<tr><td colspan="2">'+caption+'<br>'+categories+'<br>'+premium+'</td><td>'+toMonth(object.key.month)+'-'+object.key.year+'<br>Dates: '+dates+'</td><td>'+releaseOrder.adPosition+'</td><td>'+releaseOrder.adSizeL+'x'+releaseOrder.adSizeW+'</td><td>'+size+'</td><td>'+'</td></tr>';
        }
    });

    var remark = "2. "+releaseOrder.remark;

    var paymentDetails="";
    var address = firm.RegisteredAddress;
    var caddress = releaseOrder.clientState;
    var maddress = releaseOrder.publicationState;


    if(releaseOrder.paymentType === 'Cash')
    paymentDetails = "Cash"
    else if(releaseOrder.paymentType === 'Credit')
    paymentDetails = "Credit"
    else if(releaseOrder.paymentType === 'Cheque')
    paymentDetails = "Cheque of "+releaseOrder.paymentBankName+" Dated "+releaseOrder.paymentDate+" Numbered "+releaseOrder.paymentNo
    else if(releaseOrder.paymentType === 'NEFT')
    paymentDetails = "NEFT TransactionID: "+releaseOrder.paymentNo;

    console.log(releaseOrder.publicationGSTIN);

    var Details = {
        image : config.domain+'/'+firm.LogoURL,
        mediahouse :releaseOrder.publicationName,
        pgstin :releaseOrder.publicationGSTIN.GSTNo,
        cname :releaseOrder.clientName,
        cgstin :'-',
        gstin :'-',
        scheme :releaseOrder.adSchemePaid+'+'+releaseOrder.adSchemeFree,
        insertions :insData,
        username: user.name,
        firmname: firm.FirmName,
        rno : releaseOrder.releaseOrderNO,
        sign: config.domain+'/'+user.signature,
        remark: releaseOrder.Remark || "",
        jurisdiction: firm.jurisdiction ? firm.jurisdiction : address.city,
        paymentDetails: paymentDetails,
        namount: '',
        namountwords: '',
        gstamount: '',
        sgstamount: '-',
        cgstamount: '-',
        igstamount: '-',
        igst: '-',
        cgst: '-',
        sgst: '-',
        taxamount: '',
        publicationdisc: '',
        damount1: '',
        damount2:'',
        agenD1: releaseOrder.agencyDiscount1,
        agenD2: releaseOrder.agencyDiscount2,
        pubD: releaseOrder.publicationDiscount,
        edition: releaseOrder.adEdition,
        adtype:releaseOrder.adType,
        hue:releaseOrder.adHue,
        address: address?(address.address+'<br>'+address.city+"<br>"+address.state+'<br>PIN code:'+address.pincode):'',
        caddress: caddress || '',
        maddress: maddress || '',
        pullout: releaseOrder.pulloutName,
        premam : premam,
        remark: remark
    }

    if(releaseOrder.adSchemeFree === 0);
    Details['scheme'] = 'NA';

    var adGrossAmount;
    var tax = releaseOrder.taxAmount.primary;
    if(releaseOrder.taxIncluded){
        adGrossAmount = (releaseOrder.adGrossAmount/(100 + tax))*100;
    }
    else{
        adGrossAmount = releaseOrder.adGrossAmount;
    }

    publicationDisc = adGrossAmount*releaseOrder.publicationDiscount/100;
    damount1 = (adGrossAmount - publicationDisc)*(+releaseOrder.agencyDiscount1)/100;
    damount2 = (adGrossAmount - damount1 - publicationDisc)*(+releaseOrder.agencyDiscount2)/100;
    Details['damount2'] = damount2;
    Details['damount1'] = damount1;
    Details['publicationdisc'] = publicationDisc;
    var taxamount = releaseOrder.netAmountFigures;
    Details['taxamount'] = taxamount;
    Details['namount'] = taxamount + (taxamount*tax)/100;
    Details['namountwords'] = amountToWords(Math.ceil(taxamount + (taxamount*tax)/100));

    if(firm.GSTIN.GSTType !== 'URD')
        Details['gstin'] =firm.GSTIN.GSTNo;
    if(releaseOrder.clientGSTIN.GSTType !== 'URD')
        Details['cgstin'] =releaseOrder.clientGSTIN.GSTNo;
    
    Details['gstamount'] = taxamount*tax/100;
    
    if(releaseOrder.publicationState === releaseOrder.clientState){
        Details['sgst'] = Details['cgst'] = tax/2;
        Details['sgstamount'] = Details['cgstamount'] = (taxamount*tax/2)/100; 

    }
    else{
        Details['igst'] = tax;
        Details['igstamount'] = (taxamount*tax)/100;
    }


    getROhtml(Details, content => {
        response.send({
            content: content
        });
    })
};

function getROhtml(Details, callback) {
    var req = http.request(config.domain+'/templates/releaseOrder.html', res => {
        var templateHtml = "";
        res.on('data', chunk => {
            templateHtml += chunk;
        });
        res.on('end', () => {
            var today = new Date(Date.now());
            var dd = today.getDate();
            var mm = today.getMonth()+1; 
            var yyyy = today.getFullYear();
            if(dd<10){
                dd='0'+dd;
            } 
            if(mm<10){
                mm='0'+mm;
            } 
            var today = dd+'/'+mm+'/'+yyyy;
            templateHtml = templateHtml.replace('{{logoimage}}', Details.image);
            templateHtml = templateHtml.replace('{{sign}}', Details.sign);
            templateHtml = templateHtml.replace('{{mediahouse}}', Details.mediahouse);
            templateHtml = templateHtml.replace('{{pgstin}}', Details.pgstin);
            templateHtml = templateHtml.replace('{{cname}}', Details.cname);
            templateHtml = templateHtml.replace('{{cgstin}}',Details.cgstin);
            templateHtml = templateHtml.replace('{{date}}', today);
            templateHtml = templateHtml.replace('{{gstin}}', Details.gstin);
            templateHtml = templateHtml.replace('{{scheme}}', Details.scheme);
            templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
            templateHtml = templateHtml.replace('{{dper}}', Details.dper);
            templateHtml = templateHtml.replace('{{damount1}}', Details.damount1);
            templateHtml = templateHtml.replace('{{damount2}}', Details.damount2);
            templateHtml = templateHtml.replace('{{namount}}', Details.namount);
            templateHtml = templateHtml.replace('{{username}}', Details.username);
            templateHtml = templateHtml.replace('{{firmName}}', Details.firmname);
            templateHtml = templateHtml.replace('{{rno}}', Details.rno);
            templateHtml = templateHtml.replace('{{hue}}', Details.hue);
            templateHtml = templateHtml.replace('{{adtype}}', Details.adtype);
            templateHtml = templateHtml.replace('{{edition}}', Details.edition);
            templateHtml = templateHtml.replace('{{pubD}}', Details.pubD);
            templateHtml = templateHtml.replace('{{agenD1}}', Details.agenD1);
            templateHtml = templateHtml.replace('{{agenD2}}', Details.agenD2);
            templateHtml = templateHtml.replace('{{publicationdisc}}', Details.publicationdisc);
            templateHtml = templateHtml.replace('{{taxamount}}', Details.taxamount);
            templateHtml = templateHtml.replace('{{igst}}', Details.igst);
            templateHtml = templateHtml.replace('{{cgst}}', Details.cgst);
            templateHtml = templateHtml.replace('{{sgst}}', Details.sgst);
            templateHtml = templateHtml.replace('{{gstamount}}', Details.gstamount);
            templateHtml = templateHtml.replace('{{igstamount}}', Details.igstamount);
            templateHtml = templateHtml.replace('{{cgstamount}}', Details.cgstamount);
            templateHtml = templateHtml.replace('{{sgstamount}}', Details.sgstamount);
            templateHtml = templateHtml.replace('{{namountwords}}', Details.namountwords);
            templateHtml = templateHtml.replace('{{paymentDetails}}', Details.paymentDetails);
            templateHtml = templateHtml.replace('{{jurisdiction}}', Details.jurisdiction);
            templateHtml = templateHtml.replace('{{remark}}', Details.remark);
            templateHtml = templateHtml.replace('{{Address}}', Details.address);
            templateHtml = templateHtml.replace('{{pullout}}', Details.pullout);
            templateHtml = templateHtml.replace('{{caddress}}', Details.caddress);
            templateHtml = templateHtml.replace('{{maddress}}', Details.maddress);
            templateHtml = templateHtml.replace('{{premam}}', Details.premam);

            callback(templateHtml);
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}

module.exports.getROhtml = getROhtml;

module.exports.queryReleaseOrderByNo = function(request, response){
    var user = response.locals.user;
    ReleaseOrder.find({
        $and : [{$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]}, {$or:[{ 'releaseOrderNO': { $regex: request.params.keyword+"", $options:"i" }}]}]
    })
    .sort('releaseOrderNo')
    .limit(5).exec(function(err, releaseOrders){
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
async function createSheet(data, request, response, title, subject) {
    console.log(data)
    var wb = XLSX.utils.book_new();
    
    wb.Props = {
        Title: title,
        Subject: subject,
        Author: "AAMAN",
        CreatedDate: new Date(2017, 12, 19)
    };
    
    var ws = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(wb, ws, "REPORT SHEET");
    
    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    
    response.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=' + title + ".xlsx"
    });
    
    var decoder = base64.decode();
    var xlStream = new stream.PassThrough();
    xlStream.pipe(decoder)
    .pipe(response);
    
    xlStream.write(wbout);
    
    response.end();
}

module.exports.getCategories = (request, response) =>{
    if(request.body.level ==0){
        var query = {
            level:0
        };
    }
    else if(request.body.level > 0 && parent !==null)
    {
        var query = {
            level:request.body.level,
            parent:request.body.parent
        };
        
    }
    Category.find(query,function(err, categories){ 
        if(err){
            console.log("here" +err);
        }
        else{
            response.send({
                success : true,
                categories: categories
            }); 
        }
    });
}

function toMonth(a){
    if(a == 1) return 'Jan';
    else if(a == 2) return 'Feb';
    else if(a == 3) return 'Mar';
    else if(a == 4) return 'Apr';
    else if(a == 5) return 'May';
    else if(a == 6) return 'Jun';
    else if(a == 7) return 'Jul';
    else if(a == 8) return 'Aug';
    else if(a == 9) return 'Sept';
    else if(a == 10) return 'Oct';
    else if(a == 11) return 'Nov';
    else if(a == 12) return 'Dec';
}

function amountToWords(num) {
    if (!num) {
      return "Zero Only";
    }

    var a = [
      '',
      'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
      'Ten ',
      'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
    ];
    
    var b = [
      '', '',
      'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];
    
    var c = ['Crore ', 'Lakh ', 'Thousand ', 'Hundred '];
  
    if ((num = num.toString()).length > 9)
      return 'overflow';

    var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    
    if (!n)
      return;
      
    let str = '';

    for (let i = 0; i < 4; ++i) {
      str += (n[i + 1] != 0) ? (a[Number(n[i + 1])] || b[n[i + 1][0]] + ' ' + a[n[i + 1][1]]) + c[i] : '';
    }

    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : '';
    
    return str;
  }