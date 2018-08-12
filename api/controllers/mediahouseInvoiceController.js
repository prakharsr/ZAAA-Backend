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
var MediaHouseInvoice = require('../models/MediaHouseInvoice');
var Executive = require('../models/Executive');
var Client = require('../models/Client');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage=20;

module.exports.createMHInvoice = async (request,response) => {
    var user = response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var executiveID = await searchExecutiveID(request, response, user);
    var releaseorder = await ReleaseOrder.findById(request.body.releaseOrderId);
    var firm = await Firm.findById(user.firm)
    var mhinvoice = new MediaHouseInvoice({
        releaseOrderId: releaseorder._id,
        publicationName:releaseorder.publicationName,
        publicationEdition:releaseorder.publicationEdition,
        mediaType:releaseorder.mediaType,
        publicationState:releaseorder.publicationState,
        publicationGSTIN:releaseorder.publicationGSTIN,
        insertions: request.body.insertions.map(insertion => {
            return {
                ...insertion,
                
                paymentMode: releaseorder.paymentType,
                paymentDate: releaseorder.paymentDate,
                paymentNo: releaseorder.paymentNo,
                paymentAmount: releaseorder.paymentAmount,
                paymentBankName: releaseorder.paymentBankName,
            }
        }),
        releaseOrderNo: releaseorder.releaseOrderNo,
        MHINo: request.body.MHINo,
        MHIDate: request.body.MHIDate,
        MHIGrossAmount: request.body.MHIGrossAmount,
        MHITaxAmount: request.body.MHITaxAmount,
        mediahouseID: mediahouseID,
        executiveID: executiveID,
        clientID: clientID,
        firm: firm._id
    })

    var amount = (mhinvoice.MHIGrossAmount + mhinvoice.MHITaxAmount)/mhinvoice.insertions.length;
    mhinvoice.insertions.forEach(element => {
        element.Amount = amount;
        element.pendingAmount = amount;
    });
            mhinvoice.save((err,doc)=>{
                if(err){
                    response.send({
                        success: false,
                        msg: 'media house invoice cannot be created' + err
                    })
                }
                else{
                    releaseorder.insertions.filter(insertion => mhinvoice.insertions.some(ins => ins.insertionId == insertion.insertionId))
                    .forEach(insertion => insertion.mhimarked = true);
                    releaseorder.mediahouseInvoices.push(mhinvoice._id);
                    releaseorder.save((err,doc) => {
                        if(err){
                            response.send({
                                success:false,
                                msg: err + "" 
                            });
                        }
                        else{
                            response.send({
                                success:true,
                                msg:" Mediahouse Invoice saved.",
                                invoice:doc 
                            })

                        }                    
                }
            )}
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
        
        function formQuery(mediahouseID, date, user, request){
            return new Promise((resolve, reject) => {
                var query = {'firm':user.firm};
                console.log(query)
                console.log(mediahouseID, date, user)
                if(mediahouseID)
                query['mediahouseID']=mongoose.mongo.ObjectId(mediahouseID);
                if(request.body.releaseOrderNo){
                    query['releaseOrderNo']=request.body.releaseOrderNo
                }
                
                if(request.body.insertionPeriod){
                    to = new Date();
                    from =  new Date(to.getTime() - (request.body.insertionPeriod)*24*60*60*1000);
                    query['insertions.insertionDate'] = {$lte:to, $gte:from}
                }
                else{
                    to = new Date()
                    from = new Date(1);
                    //   query['insertions.insertionDate'] = {$lte:to, $gte:from}
                }
                console.log(to, from);
                console.log(query)
                resolve(query);
                
            })
        }
        
        module.exports.querySummarySheet =async function(request, response){
            var user = response.locals.user;
            var mediahouseID =await searchMediahouseID(request, response, user);
            var date = (request.body.date)?(request.body.date):null;
            var query = await formQuery(mediahouseID, date, user, request);
            query['insertions.paymentMode']="Credit";
            
            
            MediaHouseInvoice
            .aggregate([
                {$unwind: "$insertions"}, 
                {$match:query},
                { $group : { 
                    _id: {
                        roId: "$releaseOrderId",
                        "publicationName":"$publicationName",
                        "publicationEdition":"$publicationEdition",
                        "generatedAt":"$generatedAt",
                        "releaseOrderNo":"$releaseOrderNo"
                    },
                    count: {$sum: 1},
                    "pendingAmount":{$sum:"$insertions.pendingAmount"},
                    "collectedAmount":{$sum:"$insertions.collectedAmount"},
                    
                    
                    entries: { $push:  
                        {
                            "insertionDate": "$insertions.insertionDate", 
                            "Amount":"$insertions.Amount",
                            "pendingAmount":"$insertions.pendingAmount",
                            //"insertionId": "$insertions.insertionId",
                            "collectedAmount":"$insertions.collectedAmount",
                            "_id": "$insertions._id",                   
                            "MHINo":"$MHINo",
                            "MHIDate":"$MHIDate",
                            "MHIGrossAmount":"$MHIGrossAmount",
                            "MHITaxAmount":"$MHIAmount"
                        } }
                    } },
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
                        response.send({
                            success:true,
                            insertions: insertions
                            
                        })
                        
                    }
                });
            };
            
            module.exports.queryMediaHouseInvoices =async function(request, response){
                var user = response.locals.user;
                var mediahouseID =await searchMediahouseID(request, response, user);
                var date = (request.body.date)?(request.body.date):null;
                var query = await formQuery(mediahouseID, date, user, request);
                
                
                MediaHouseInvoice
                .find(query)
                .limit(perPage)
                .skip((perPage * request.body.page) - perPage)
                .exec(function(err, mediahouseInvoice){
                    if(err){
                        console.log(err+ "");
                        response.send({
                            success:false,
                            msg: err +""
                        });
                    }
                    else{
                        MediaHouseInvoice.count(query, function(err, count){
                            response.send({
                                success:true,
                                mediahouseInvoice: mediahouseInvoice,
                                page: request.body.page,
                                perPage:perPage,
                                pageCount: Math.ceil(count/perPage)
                            });
                        })
                        
                    }
                });
            };


            
            
            module.exports.generateSummarySheet = function(request, response){
                var user = response.locals.user;
                try {
                    var mhis = request.body.mhis; // { _id, amount: number }[]
                    
                    MediaHouseInvoice.find({ firm: user.firm }).then(invoices => {
                        invoices.forEach(invoice => {
                            invoice.insertions.forEach(mhiInsertion => {
                                mhis.forEach(insertion => {
                                    if (mhiInsertion._id == insertion._id) {
                                        mhiInsertion.collectedAmount += insertion.amount;
                                        mhiInsertion.pendingAmount -=insertion.amount;
                                        
                                    }
                                });
                            });
                            
                            invoice.save(function(err) {
                                if (err) {
                                    response.send({
                                        success: false,
                                        msg: "error" + err
                                    });
                                }
                            });
                        });
                    });
                }
                catch (err) {
                    if (err)
                    console.log(err)
                }
                
                response.send({
                    success:true,
                    msg:"done"
                })
            };
            
            module.exports.queryMediaHouseReports =async function(request, response){
                var user = response.locals.user;
                var mediahouseID =await searchMediahouseID(request, response, user);
                var date = (request.body.date)?(request.body.date):null;
                var query = await formQuery(mediahouseID, date, user, request);       
                
                MediaHouseInvoice
                .aggregate([
                    {$unwind: "$insertions"}, 
                    {$match:query},
                    { $group : { 
                        _id: {
                            roId: "$releaseOrderId",
                            "publicationName":"$publicationName",
                            "publicationEdition":"$publicationEdition",
                            "generatedAt":"$generatedAt",
                            "releaseOrderNo":"$releaseOrderNo",
                            "MHINo":"$MHINo"
                        },
                        count: {$sum: 1},
                        "pendingAmount":{$sum:"$insertions.pendingAmount"},
                        "collectedAmount":{$sum:"$insertions.collectedAmount"},
                        entries: { $push:  
                            {                                
                                "insertionDate": "$insertions.insertionDate", 
                                "Amount":"$insertions.Amount",
                                "pendingAmount":"$insertions.pendingAmount",
                                //"insertionId": "$insertions.insertionId",
                                "collectedAmount":"$insertions.collectedAmount",
                                "receiptNumber":"$insertions.receiptNumber",
                                "receiptDate":"$insertions.receiptDate",
                                "paymentMode":"$insertions.paymentMode",
                                "paymentDate":"$insertions.paymentDate",
                                "paymentAmount":"$insertions.paymentAmount",
                                "paymentNo":"$insertions.paymentNo",
                                "paymentBankName":"$insertions.paymentBankName",
                                "_id": "$insertions._id",

                                "MHIDate":"$MHIDate",
                                "MHIGrossAmount":"$MHIGrossAmount",
                                "MHITaxAmount":"$MHIAmount"
                            } }
                        } }
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
                            response.send({
                                success:true,
                                insertions: insertions                               
                            });
                            
                        }
                    });
                };
                
                
                module.exports.updateReceipts = function(request, response){
                    var user = response.locals.user;
                    try {
                        var mhis = request.body.mhis; // { _id, amount: number }[]
                        
                        MediaHouseInvoice.find({ firm: user.firm }).then(invoices => {
                            invoices.forEach(invoice => {
                                invoice.insertions.forEach(mhiInsertion => {
                                    mhis.forEach(insertion => {
                                        if (mhiInsertion._id == insertion._id) {
                                            mhiInsertion.receiptDate = insertion.receiptDate;
                                            mhiInsertion.receiptNumber =insertion.receiptNumber;
                                            // mhiInsertion.paymentDate =insertion.paymentDate;
                                            // mhiInsertion.paymentNo =insertion.paymentNo;
                                            // mhiInsertion.paymentMode =insertion.paymentMode;
                                            // mhiInsertion.paymentBankName =insertion.paymentBankName;
                                        }
                                    });
                                });
                                
                                invoice.save(function(err) {
                                    if (err) {
                                        response.send({
                                            success: false,
                                            msg: "error" + err
                                        });
                                    }
                                });
                            });
                        });
                    }
                    catch (err) {
                        if (err)
                        console.log(err)
                    }
                    
                    response.send({
                        success:true,
                        msg:"done"
                    })
                };

                module.exports.generateSummarySheetPdf = (request,response) => {
                    var Details = {};
                    pdf.generateSummarySheet(request, response, Details);
                }
                