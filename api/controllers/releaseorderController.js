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
var Invoice = require('../models/Invoice');
var MediaHouseInvoice = require('../models/MediaHouseInvoice');
var Category = require('../../admin/models/Categories');
var Executive = require('../models/Executive');
var Client = require('../models/Client');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;
var http = require('http');
var fs = require('fs');

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
    if(sn < 10){
        sn = '00'+sn;
    }
    else if(sn < 100){
        sn = '0'+sn;
    }
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    if(month < 10){
        month = '0'+month;
    }
    var rno = month+year+'-'+sn;
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
        sac:request.body.sac,
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
        clientPayment:request.body.clientPayment,
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
    {$match:{firm:user.firm, generated:true, cancelled:false} },
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
    var firm = response.locals.firm;
    var list = request.body.ids;
    var success = true;
try{
    ReleaseOrder.find({ firm: user.firm }).then(releaseOrders => {
        releaseOrders.forEach(releaseOrder => {
            releaseOrder.insertions.forEach(ROInsertion => {
                list.forEach(id => {
                    if (ROInsertion._id == id) {
                        ROInsertion.state = request.body.state;
                    }
                });
            });
            
            releaseOrder.save(function(err) {
                if (err) {
                    success = false;
                }
            });
        });
    });
    Invoice.find({ firm: user.firm }).then(invoices => {
        invoices.forEach(invoice => {
            invoice.insertions.forEach(INinsertion => {
                list.forEach(id => {
                    if (INinsertion._id == id) {
                        INinsertion.state = request.body.state;
                    }
                });
            });
            
            invoice.save(function(err) {
                if (err) {
                    success = false;
                }
            });
        });
    });
    MediaHouseInvoice.find({ firm: user.firm }).then(invoices => {
        console.log(invoices)
        invoices.forEach(invoice => {
            invoice.insertions.forEach(mhiInsertion => {
                list.forEach(id => {
                    if (mhiInsertion.insertionId == id) {
                        mhiInsertion.state = request.body.state;
                    }
                });
            });
            
            invoice.save(function(err) {
                if (err) {
                    success = false;
                }
            });
        });
    });
}
catch(err){
    success = false;
    console.log((err))
}
finally{
    response.send({
        success:success,
        msg:"Yes"
    })

}

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
        if(request.body.insertionStatus!==undefined)
        query['insertions.state'] = request.body.insertionStatus;
        
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
    .sort("-createdAt")
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
    var firm = response.locals.firm;
    ReleaseOrder
    .findById(mongoose.mongo.ObjectId(request.body.id))
    .exec(function(err, releaseOrder){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +" juihjo"
            });
        }
        else{
            if(releaseOrder.generated){
                response.send({
                    success:false,
                    msg:"Already Generated"
                })
            }
            //don't know the above if is required or not 
            else{
                releaseOrder.generated = true;
                var date = new Date();
                releaseOrder.generatedAt = date;
                releaseOrder.faddress = firm.RegisteredAddress;
                releaseOrder.femail = firm.Email;
                releaseOrder.fmobile = firm.Mobile;
                releaseOrder.flogo = firm.LogoURL;
                releaseOrder.fsign = user.signature;
                var juris = firm.Jurisdication ? firm.Jurisdication: firm.RegisteredAddress.city;
                releaseOrder.fjuris = juris;
                var i = 0;
                var tnc ='';
                for(; i < firm.ROterms.length; i++){
                    tnc += (i+1)+'.'+firm.ROterms[i]+'<br>';
                }
                releaseOrder.tnc = tnc;
                releaseOrder.save(function(err){
                    if(err){
                        console.log(err)
                        response.send({
                            success:false,
                            msg:"Error in Generating RO"
                        })
                    }
                    else{
                        response.send({
                            success:true,
                            msg:"Generated"
                        })
                    }
                })
    
            }
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


module.exports.searchCategories = function(request, response){
    Category.find({
        'name': { $regex: request.params.keyword+"", $options:"i" }
    })
    .limit(5)
    .exec(async function(err, categories){ 
        if(err){
            console.log("here" +err);
        }
        else{
            var catarray = [];
            for (var i = 0; i < categories.length; ++i) {
                var element = categories[i];
                var array = [];  
                array.push(element);  
                var level = element.level;
                var parent = element.parent;
                while(level-- > 0){
                    try{
                    var category = await Category.findById(mongoose.mongo.ObjectId(parent));
                    array.unshift(category);
                    parent = category.parent;
                    }
                    catch(err){
                        console.log(err);
                    }
                }
                catarray.push(array);
            }
            response.send({
                success : true,
                categories: catarray
            }); 
        }
    });
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

function getROhtml(Details, callback) {
    fs.readFile(path.resolve(__dirname, '../../public/templates/releaseOrder.html'),'utf8', (err, templateHtml) => {
        if(err){
            console.log(err);
        }
        else{
            var today = toReadableDate(new Date(Date.now()));
            
            templateHtml = templateHtml.replace('{{logoimage}}', Details.image)
              .replace('{{sign}}', Details.sign)
              .replace('{{mediahouse}}', Details.mediahouse)
              .replace('{{pgstin}}', Details.pgstin)
              .replace('{{cname}}', Details.cname)
              .replace('{{cgstin}}',Details.cgstin)
              .replace('{{date}}', today)
              .replace('{{gstin}}', Details.gstin)
              .replace('{{scheme}}', Details.scheme)
              .replace('{{insertions}}', Details.insertions)
              .replace('{{dper}}', Details.dper)
              .replace('{{damount}}', Details.damount)
              .replace('{{namount}}', Details.namount)
              .replace('{{username}}', Details.username)
              .replace('{{firmName}}', Details.firmname)
              .replace('{{firmName1}}', Details.firmname1)
              .replace('{{rno}}', Details.rno)
              .replace('{{hue}}', Details.hue)
              .replace('{{adtype}}', Details.adtype)
              .replace('{{edition}}', Details.edition)
              .replace('{{pubD}}', Details.pubD)
              .replace('{{agenD1}}', Details.agenD1)
              .replace('{{agenD2}}', Details.agenD2)
              .replace('{{publicationdisc}}', Details.publicationdisc)
              .replace('{{taxamount}}', Details.taxamount)
              .replace('{{igst}}', Details.igst)
              .replace('{{cgst}}', Details.cgst)
              .replace('{{sgst}}', Details.sgst)
              .replace('{{gstamount}}', Details.gstamount)
              .replace('{{igstamount}}', Details.igstamount)
              .replace('{{cgstamount}}', Details.cgstamount)
              .replace('{{sgstamount}}', Details.sgstamount)
              .replace('{{namountwords}}', Details.namountwords)
              .replace('{{paymentDetails}}', Details.paymentDetails)
              .replace('{{remark}}', Details.remark)
              .replace('{{Address}}', Details.address)
              .replace('{{pullout}}', Details.pullout)
              .replace('{{caddress}}', Details.caddress)
              .replace('{{maddress}}', Details.maddress)
              .replace('{{premam}}', Details.premam)
              .replace('{{medition}}', Details.medition)
              .replace('{{phone}}', Details.phone)
              .replace('{{email}}', Details.email)
              .replace('{{tnc}}', Details.tnc);
              
              callback(templateHtml);
        }
    });
}

module.exports.getROhtml = getROhtml;


module.exports.mailROPdf = function(request, response) {
    var user = response.locals.user;
    var firm = response.locals.firm;
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
                msg: 'Invoice not found' 
            });
        }
        else{
            if (releaseOrder.generated==false){
                releaseOrder.faddress = firm.RegisteredAddress;
                releaseOrder.femail = firm.Email;
                releaseOrder.fmobile = firm.Mobile;
                releaseOrder.flogo = firm.LogoURL;
                releaseOrder.fsign = user.signature;
                var juris = firm.Jurisdication ? firm.Jurisdication: firm.RegisteredAddress.city;
                releaseOrder.fjuris = juris;
                var i = 0;
                var tnc ='';
                for(; i < firm.ROterms.length; i++){
                    tnc += (i+1)+'.'+firm.ROterms[i]+'<br>';
                }
                releaseOrder.tnc = tnc;
                tnc += (i+1)+'. All disputed are subject to '+juris+' jurisdiction only.';
                releaseOrder.generated=true;
                var date = new Date();
                releaseOrder.generatedAt = date;
            }
            releaseOrder.save(async function(err,releaseOrder){
                if(err){
                    response.send({
                        success:false,
                        msg: err
                    })
                }
                else{
                    var Details = createDocument(request,response,releaseOrder);
                    pdf.mailReleaseOrder(request,response,Details);
                }
            })
        }
    });
}

module.exports.generateROPdf = async function(request, response) {
    var user = response.locals.user;
    var firm = response.locals.firm;
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
                msg: 'Invoice not found' 
            });
        }
        else{
            if (releaseOrder.generated==false){
                releaseOrder.faddress = firm.RegisteredAddress;
                releaseOrder.femail = firm.Email;
                releaseOrder.fmobile = firm.Mobile;
                releaseOrder.flogo = firm.LogoURL;
                releaseOrder.fsign = user.signature;
                var juris = firm.Jurisdication ? firm.Jurisdication: firm.RegisteredAddress.city;
                releaseOrder.fjuris = juris;
                var i = 0;
                var tnc ='';
                for(; i < firm.ROterms.length; i++){
                    tnc += (i+1)+'.'+firm.ROterms[i]+'<br>';
                }
                releaseOrder.tnc = tnc;
                tnc += (i+1)+'. All disputed are subject to '+juris+' jurisdiction only.';
                releaseOrder.generated=true;
                var date = new Date();
                releaseOrder.generatedAt = date;
            }
            releaseOrder.save(async function(err,releaseorder){
                if(err){
                    response.send({
                        success:false,
                        msg: err
                    })
                }
                else{
                    var Details = createDocument(request,response,releaseorder);
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
    doc['flogo'] = firm.LogoURL;
    doc['fsign'] = user.signature;
    var juris = firm.Jurisdication ? firm.Jurisdication: firm.RegisteredAddress.city;
    doc['faddress'] = firm.RegisteredAddress;
    doc['fmobile'] = firm.Mobile;
    doc['femail'] = firm.Email;
    console.log(doc);
    var tnc ='';
    var i = 0;
    for(; i < firm.ROterms.length; i++){
        tnc += (i+1)+'.'+firm.ROterms[i]+'<br>';
    }
    doc['tnc'] = tnc;
    tnc += (i+1)+'. All disputed are subject to '+juris+' jurisdiction only.';
    var Details = createDocument(request,response,doc);
    getROhtml(Details, content => {
        response.send({
            content: content
        });
    })
};

function createDocument(request, response, doc){
    var user = response.locals.user;
    var firm = response.locals.firm;
    var result = doc.insertions.reduce((grouped, item) => {
        var index = grouped.findIndex(m => m.key.month == item.date.month && m.key.year == item.date.year);
        if (index == -1) {
            grouped.push({ key: { month: item.date.month, year: item.date.year }, items: [item] });
        }
        else grouped[index].items.push(item);
        return grouped;
    }, []);

    var insertions = doc.insertions;
    var size = doc.adSizeL * doc.adSizeW;
    var damount = (doc.publicationDiscount+doc.agencyDiscount1+doc.agencyDiscount2)*doc.adGrossAmount;
    var namount = doc.adGrossAmount - damount;
    var caption = doc.caption?doc.caption+'<br>':"";
    var catarray = [doc.adCategory2, doc.adCategory3, doc.adCategory4, doc.adCategory5, doc.adCategory6];
    var categories = doc.adCategory1 || '';
    var premam = 0;
    var premium = '';
    
    catarray.forEach(function loop(element){
        if(loop.stop){return ;}
        if (element) {
            categories += '-' + element;
        }
        else{
            categories += "<br>"
            loop.stop = true;
        }
    });
    var insData = '';
    var count = 0;
    result.sort((a, b) => {
        if (+a.key.year > +b.key.year)
          return true;
        else if (+a.key.year < +b.key.year)
          return false;
        else return +a.key.month > +b.key.month;
    })
      .forEach(object =>{
        console.log(object.items);
        var dates = "";
        var array = [];
        object.items.forEach(obj => {
            array.push(+obj.date.day);            
        });
        array.sort((a, b) => +a > +b);

        array.forEach(obj => {
            dates += obj + " ";
        })

        var row = result.length;

        if(count === 0){
            insData += '<tr><td colspan="3" rowspan='+row+'>'+caption+''+categories+''+premium+'</td><td>'+toMonth(object.key.month)+'-'+object.key.year+'<br>Dates: '+dates+'</td><td rowspan='+row+'>'+doc.adPosition+'</td><td rowspan='+row+'>'+(doc.adSizeL?doc.adSizeL:'0')+'x'+(doc.adSizeW?doc.adSizeW:'0')+'</td><td rowspan='+row+'><b>₹ '+addZeroes(""+Math.round(doc.adGrossAmount))+'</b></td></tr>';
            count = 1;
        }
        else{
            insData+='<tr><td>'+toMonth(object.key.month)+'-'+object.key.year+'<br>Dates: '+dates+'</td></tr>';
        }
    });
    
    var remark = doc.remark?doc.remark:'';

    var paymentDetails="";
    var address = doc.faddress;
    var caddress = doc.clientState;
    var maddress = doc.publicationState;

    if(doc.paymentType === 'Cash')
    paymentDetails = "Cash"
    else if(doc.paymentType === 'Credit')
    paymentDetails = "Credit"
    else if(doc.paymentType === 'Cheque')
    paymentDetails = "Cheque of "+doc.paymentBankName+" Dated "+toReadableDate(doc.paymentDate)+" Numbered "+doc.paymentNo
    else if(doc.paymentType === 'NEFT')
    paymentDetails = "NEFT TransactionID: "+doc.paymentNo;

    var Details = {
        mediahouse :doc.publicationName,
        medition : doc.publicationEdition,
        pgstin :'-',
        cname :doc.clientName,
        cgstin :'-',
        gstin :'-',
        sac:doc.sac|| '',
        scheme :doc.adSchemePaid+'+'+doc.adSchemeFree,
        insertions :insData,
        username: user.name,
        firmname: firm.FirmName,
        firmname1: firm.FirmName,
        rno : doc.releaseOrderNO,
        remark: doc.Remark || "",
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
        damount: '',
        agenD1: doc.agencyDiscount1,
        agenD2: doc.agencyDiscount2,
        pubD: doc.publicationDiscount,
        edition: doc.adEdition,
        adtype:doc.adType,
        hue:doc.adHue,
        caddress: caddress || '',
        maddress: maddress || '',
        pullout: doc.pulloutName,
        premam : "₹ "+addZeroes(""+Math.round(premam)),
        remark: remark,
        tnc: doc.tnc,
        image : config.domain+'/'+doc.flogo,
        sign: config.domain+'/'+doc.fsign,
        jurisdiction: doc.fjuris,
        address: address?(address.address+'<br>'+address.city+"<br>"+address.state+'<br>PIN code:'+address.pincode):'',
        phone: "Phone: "+doc.fmobile || '',
        email: "Email: "+doc.femail || ''
    }

    if(doc.adSchemeFree === 0);
    Details['scheme'] = 'NA';

    var adGrossAmount;
    var tax = doc.taxAmount.primary;
    if(doc.taxIncluded){
        adGrossAmount = (doc.adGrossAmount/(100 + tax))*100;
    }
    else{
        adGrossAmount = doc.adGrossAmount;
    }

    publicationDisc = adGrossAmount*doc.publicationDiscount/100;
    damount1 = (adGrossAmount - publicationDisc)*(+doc.agencyDiscount1)/100;
    damount2 = (adGrossAmount - damount1 - publicationDisc)*(+doc.agencyDiscount2)/100;
    damount1 += damount2;
    Details['damount'] = '₹ '+ (damount1.toFixed(2));
    Details['publicationdisc'] ='₹ '+ (publicationDisc.toFixed(2));
    var taxamount = doc.adGrossAmount + premam - publicationDisc - damount1;
    var namount = doc.netAmountFigures;
    Details['taxamount'] ='₹ '+ (taxamount.toFixed(2));
    Details['namount'] ='₹ '+ (namount.toFixed(2));
    Details['namountwords'] = amountToWords(Math.ceil(taxamount + (taxamount*tax)/100));

    if(firm.GSTIN.GSTType !== 'URD')
        Details['gstin'] =firm.GSTIN.GSTNo;
    if(doc.clientGSTIN.GSTType !== 'URD')
        Details['cgstin'] =doc.clientGSTIN.GSTNo;
    if(doc.publicationGSTIN.GSTType !== 'URD')
        Details['gstin'] =doc.publicationGSTIN.GSTNo;

    var g = (taxamount*tax/100).toFixed(2);
    
    Details['gstamount'] ='₹ '+ g
    
    if(doc.publicationState === doc.clientState){
        Details['sgst'] = Details['cgst'] = tax/2;
        var t = ((taxamount*tax/2)/100).toFixed(2);
        Details['sgstamount'] = Details['cgstamount'] = '₹ ' + t;

    }
    else{
        Details['igst'] = tax;
        var t = ((taxamount*tax)/100).toFixed(2);
        Details['igstamount'] ='₹ '+t;
    }
    return Details;
}

module.exports.queryReleaseOrderByNo = function(request, response){
    var user = response.locals.user;
    ReleaseOrder.find({
        $and : [{$or:[{firm:mongoose.mongo.ObjectId(user.firm)},{global:true}]},{generated:true}, {$or:[{ 'releaseOrderNO': { $regex: request.params.keyword+"", $options:"i" }}]}]
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
    else if(request.body.level > 0 && request.body.parent !==null)
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
    return ['Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec'][a - 1];
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

function toReadableDate(a){
    var today = a;
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    return dd+'/'+mm+'/'+yyyy;
}

function addZeroes(num) {
    var value = Number(num);   
    var res = num.split(".");     
    if(res.length == 1 || res[1].length < 3) { 
        value = value.toFixed(2);
    }
    return value;
}
    