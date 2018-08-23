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
var Executive = require('../models/Executive');
var Invoice = require('../models/Invoice');
var Client = require('../models/Client');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var http = require('http');
var perPage=20;


function findReleaseOrder(request, response, user){
    return new Promise((resolve, reject)=>{
        console.log(request.body)
        ReleaseOrder.findOne({
            $and:[
                {firm:user.firm},
                {"_id":mongoose.mongo.ObjectID(request.body.releaseOrderId)},
                {"insertions._id":{$in:request.body.insertions.map(insertion => insertion._id)}}
            ]
            
        }).exec( function(err, releaseOrder){
            if(err){
                console.log(err)
                reject(err)
            }
            else{
                console.log(releaseOrder);
                resolve(releaseOrder);
            }
        })
    })
}

function findExecutive(id){
    return new Promise((resolve, reject) => {
        Executive.findById(mongoose.mongo.ObjectID(id), function(err, executive){
            if(err){
                console.log(err)
                reject(err)
            }
            else if(!executive)
            {
                resolve(null);
            }
            else{
                resolve(executive);
            }
        })
    })
}
function findClient(id){
    return new Promise((resolve, reject) => {
        Client.findById(mongoose.mongo.ObjectID(id), function(err, client){
            if(err){
                console.log(err)
                reject(err)
            }
            else if(!client)
            {
                resolve(null);
            }
            else{
                resolve(client);
            }
        })
    })
}
function findFirm(id){
    return new Promise((resolve, reject) => {
        Firm.findById(mongoose.mongo.ObjectID(id), function(err, firm){
            if(err){
                console.log(err)
                reject(err)
            }
            else if(!firm)
            {
                resolve(null);
            }
            else{
                resolve(firm);
            }
        })
    })
}
function findMediahouse(id){
    return new Promise((resolve, reject) => {
        console.log(id)
        MediaHouse.findById(mongoose.mongo.ObjectId(id), function(err, mediahouse){
            if(err){
                console.log(err)
                reject(err)
            }
            else if(!mediahouse)
            {
                resolve(null);
            }
            else{
                resolve(mediahouse);
            }
        })
    })
}
async function f(request, response, user){
    try {
        var releaseOrder = await findReleaseOrder(request, response, user)
        var firm = response.locals.firm;
        var mediahouse = await findMediahouse(releaseOrder.mediahouseID);
        var client = await findClient(releaseOrder.clientID);
        var executive = await findExecutive(releaseOrder.executiveID);
        var counter = releaseOrder.invoiceSerial+1;
        var ino = releaseOrder.releaseOrderNO+'/'+counter
        
    }
    catch(err){
        console.log(err);
    };
    var invoice = new Invoice({
        releaseOrderId :request.body.releaseOrderId,
        invoiceNO: ino,
        agencyName: firm.FirmName,
        agencyGSTIN: firm.GSTIN,
        agencyPerson: user.name,
        agencyState:firm.OfficeAddress.state,
        signature: user.signature,
        clientName:client.OrganizationName,
        clientGSTIN:request.body.GSTIN,
        clientState:client.Address.state,
        publicationName:mediahouse.PublicationName,
        publicationEdition:mediahouse.Address.edition,
        mediaType:mediahouse.MediaType,
        publicationState:mediahouse.Address.state,
        publicationGSTIN:mediahouse.GSTIN,
        
        adGrossAmount:request.body.adGrossAmount,
        publicationDiscount:request.body.publicationDiscount,
        agencyDiscount1:request.body.agencyDiscount1,
        agencyDiscount2:request.body.agencyDiscount2,
        taxAmount:request.body.taxAmount,
        taxIncluded:request.body.taxIncluded,
        netAmountFigures:request.body.netAmountFigures,
        netAmountWords:request.body.netAmountWords,
        otherCharges:request.body.otherCharges,
        extraCharges:request.body.extraCharges,
        pendingAmount:request.body.FinalTaxAmount,
        FinalTaxAmount:request.body.FinalTaxAmount,
        
        caption:request.body.caption,
        remark:request.body.remark,
        otherRemark:request.body.otherRemark,
        insertions: request.body.insertions,
        executiveName:executive.ExecutiveName,
        executiveOrg:executive.OrganizationName,
        
        template: firm.ROTemplate,
        firm:user.firm,
        mediahouseID : releaseOrder.mediahouseID,
        clientID: releaseOrder.clientID,
        executiveID: releaseOrder.executiveID,
    });
    invoice.save(function(err, doc){
        if(err){
            console.log(err);
            response.send({
                success:false,
                msg: "Error! in saving Invoice" + err
            })
        }
        else{
            Client.update(
                { $and: [{firm:user.firm}, {"_id":doc.clientID}] },
                { $set: { "GSTIN": doc.clientGSTIN }}
            )
            .exec(err,function(){
                if(err){
                    response.send({
                        success:false,
                        msg:"Error in updating client GST number"
                    })
                }
            });
            releaseOrder.insertions.filter(insertion => invoice.insertions.some(ins => ins.date.day == insertion.date.day
                && ins.date.month == insertion.date.month
                && ins.date.year == insertion.date.year))
                .forEach(insertion => insertion.marked = true);
                releaseOrder.invoiceSerial += 1;
                releaseOrder.save((err,doc) => {
                    if(err){
                        request.body.insertions.map(insertion => insertion._id)
                        response.send({
                            success:false,
                            msg: err + "" + request.body.insertions.map(insertion => insertion._id)
                        });
                    }
                    else{
                        console.log(mongoose.mongo.ObjectId(request.body.releaseOrderId), request.body.insertions.map(insertion => mongoose.mongo.ObjectId(insertion._id)))
                        response.send({
                            success:true,
                            msg:"Invoice saved.",
                            invoice:doc 
                        })
                    }
                })
            }
        })
    };
    module.exports.createInvoice = function(request, response){
        f(request, response, response.locals.user)
    };
    module.exports.getInvoice = function(request,response){
        var user = response.locals.user;
        Invoice.findById(request.params.id,async function(err, invoice){
            if(err){
                console.log("here" +err);
                response.send({
                    success:false,
                    msg: err+"",
                });
            }
            else{
                try{
                    var mediahouse = await findMediahouse(invoice.mediahouseID);
                    var executive = await findExecutive(invoice.executiveID);
                    var client = await findClient(invoice.clientID);
                    var releaseOrder = await ReleaseOrder.findById(invoice.releaseOrderId);
                    response.send({
                        mediahouse: mediahouse,
                        client: client,
                        executive: executive,
                        success : true,
                        releaseOrder: releaseOrder,
                        invoice : invoice
                    }); 
                }
                catch(err){
                    response.send({
                        success: false,
                        msg: "Can't fetch Invoice" + err
                    });
                }
            }
        });
    };
    
    module.exports.getInvoices = function(request, response){
        var user = response.locals.user;
        Invoice.find({firm:user.firm})
        .limit(perPage)
        .skip((perPage*request.params.page) - perPage)
        .sort(-'date')
        .exec(function(err, invoice){
            if(err){
                console.log("here");
                response.send({
                    success:false,
                    msg: err + ""
                });
            }
            else if(!invoice){
                console.log("No releaseorder");
                response.send({
                    success:false,
                    msg:" No release Order"
                });
            }
            else{
                Invoice.count({}, function(err, count){
                    response.send({
                        success : true,
                        invoice : invoice,
                        perPage:perPage,
                        page: request.params.page,
                        pageCount : Math.ceil(count/perPage)
                        
                    });
                })
            }
        });
    };
    
    module.exports.getInvoiceInsertions = function(request, response){
        var user  =response.locals.user;
        Invoice
        .aggregate([{$unwind: "$insertions"}, 
        {$match:{firm:user.firm} },
        {$project: {
            "_id":1,
            "publicationName":1,
            "publicationEdition":1, 
            "clientName":1,
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
            msg:" No inseryions"
        });
    }
    else{
        Invoice.count({}, function(err, count){    
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
            var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.creationPeriod);
            query['date']={$gte: from, $lte:to} 
        }
        else{
            var to = new Date()
            var from = new Date(1);
            query['date']={$gte: from, $lte:to} 
        }
        if(request.body.insertionPeriod){
            var to = new Date()
            var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.insertionPeriod);
        }
        if(request.body.invoiceNO)
        query['invoiceNO'] = request.body.invoiceNO
        
        if(request.body.hasPendingAmount)
        query['pendingAmount'] = {$gt : 0}
        
        resolve(query);
        
    })
    
    
}

module.exports.queryInvoice = async function(request, response){
	var user = response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var executiveID = await searchExecutiveID(request, response, user);
    var date = (request.body.date)?(request.body.date):null;
    
    var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request);
    console.log(request.body)
    console.log(query)
    console.log(request.body)
    
    Invoice.find(query)
    .limit(perPage)
    .skip((perPage * request.body.page) - perPage)
    .sort({"createdAt":-1})
    .exec(function(err, invoice){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            Invoice.count(query, function(err, count){
                console.log(invoice, count)
                response.send({
                    success:true,
                    invoice: invoice,
                    page: request.body.page,
                    perPage:perPage,
                    pageCount: Math.ceil(count/perPage)
                });
            })
            
        }
    });
};
module.exports.getInvoicesForRO = function(request, response){
    var user = response.locals.user;
    Invoice.find({
        "firm":user.firm,
        "releaseOrderId": mongoose.mongo.ObjectID(request.body.releaseOrderId)
    })
    .sort(-'invoiceNO')
    .exec(function(err, invoices){
        if(err){
            console.log("here");
            response.send({
                success:false,
                msg: err + ""
            });
        }
        else if(invoices.length ==0){
            console.log("No Invoices");
            response.send({
                success:false,
                msg:" No Invoices"
            });
        }
        else{
            console.log("hi")
                response.send({
                    success : true,
                    invoices:invoices,
            })
        }
    });    
};


module.exports.queryClientPayments = async function(request, response){
    var user = response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var executiveID = await searchExecutiveID(request, response, user);
    var date = (request.body.date)?(request.body.date):null;
    var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request);
    
    
    Invoice.aggregate([ 
        {$match:query},
        {$sort:{ "createdAt":-1}},
        { $group : { 
            _id: "$clientID",
            count: {$sum: 1},
            
            shadow :{$sum:{ $add: [ "$shadowAmount", "$collectedAmount" ] }},
            balance :{$sum: "$pendingAmount" },
            totalBalance:{$sum: { $add: [ "$pendingAmount","$shadowAmount", "$collectedAmount" ] } },
            entries: { $push:  
                {
                    "publicationName":"$publicationName",
                    "publicationEdition":"$publicationEdition", 
                    "clientName":"$clientName",
                    "invoiceNO":"$invoiceNO",
                    shadow :{ $add: [ "$shadowAmount", "$collectedAmount" ] },
                    "balance":"$pendingAmount",
                    "totalBalance":{ $add: [ "$shadowAmount", "$pendingAmount", "$collectedAmount" ] },
                    "executiveOrg":"$executiveOrg",
                    "executiveName": "$executiveName",
                    "createdAt":"$createdAt"
                } }
                
            } },
            {$limit: perPage},
            {$skip:(perPage * request.body.page) - perPage},
        ])
        .exec(function(err, invoices){
            if(err){
                console.log(err+ "");
                response.send({
                    success:false,
                    msg: err +""
                });
            }
            else{
                Invoice.count(query, function(err, count){
                    response.send({
                        success:true,
                        invoices: invoices,
                        page: request.body.page,
                        perPage:perPage,
                        pageCount: Math.ceil(count/perPage)
                    });
                })
                
            }
        });
    };
    module.exports.queryExecutivePayments = async function(request, response){
        var user = response.locals.user;
        var mediahouseID =await searchMediahouseID(request, response, user);
        var clientID = await searchClientID(request, response, user);
        var executiveID = await searchExecutiveID(request, response, user);
        var date = (request.body.date)?(request.body.date):null;
        var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request);
        Invoice.aggregate([ 
            {$match:query},
            {$sort:{ "createdAt":-1}},
            { $group : { 
                _id: "$executiveID",
                count: {$sum: 1},
                
            shadow :{$sum:{ $add: [ "$shadowAmount", "$collectedAmount" ] }},
            balance :{$sum: "$pendingAmount" },
            totalBalance:{$sum: { $add: [ "$pendingAmount","$shadowAmount", "$collectedAmount" ] } },
                entries: { $push:  
                    {
                        "publicationName":"$publicationName",
                        "publicationEdition":"$publicationEdition", 
                        "clientName":"$clientName",
                        "invoiceNO":"$invoiceNO",
                        shadow :{ $add: [ "$shadowAmount", "$collectedAmount" ] },
                        "balance":"$pendingAmount",
                        "totalBalance":{ $add: [ "$shadowAmount", "$pendingAmount", "$collectedAmount" ] },
                        "executiveOrg":"$executiveOrg",
                        "executiveName": "$executiveName",
                        "createdAt":"$createdAt"
                    } }
                    
                } },
                {$limit: perPage},
                {$skip:(perPage * request.body.page) - perPage},
            ])
            .exec(function(err, invoices){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    Invoice.count(query, function(err, count){
                        response.send({
                            success:true,
                            invoices: invoices,
                            page: request.body.page,
                            perPage:perPage,
                            pageCount: Math.ceil(count/perPage)
                        });
                    })
                    
                }
            });
        }
        
        
        
        
        module.exports.deleteInvoice = function(request, response){
            var user = response.locals.user;
            ReleaseOrder.updateMany(
                { $and: [{firm:user.firm}, {"insertions._id":{$in:request.body.ids}}]
            },
            { $set: { "insertions.$.marked": false }}
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
                
                Invoice.findByIdAndRemove(request.params.id,function(err){
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
                            msg: "Invoice deleted"
                        });
                    }
                    
                })
            }
        })
    };
    
    module.exports.updateInvoice = function(request, response){
        var user = response.locals.user;
        delete request.body.createdAt;
        delete request.body.updatedAt;
        Invoice.findByIdAndUpdate(request.body.id,{$set:request.body},function(err, invoice){
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
                    msg: "invoice Updated"
                });
            }
            
        })
    };
    
    module.exports.mailInvoicePdf = function(request, response) {
        var user = response.locals.user;
        var firm = response.locals.firm;
        console.log(request.body);
        Invoice.findById(request.body.id, async function(err, invoice){
            if(err){
                console.log(err);
                response.send({
                    success :false,
                    msg: err 
                });
            }
            else if(!invoice){
                response.send({
                    success :false,
                    msg: 'Invoice not found' 
                });
            }
            else{
                var Details = createDocument(request,response,invoice);
                pdf.mailinvoice(request,response,Details);
            }
        });
    }
    
    module.exports.generateInvoicePdf = async function(request, response) {
        var user = response.locals.user;
        var firm = response.locals.firm;
        console.log(request.body);
        Invoice.findById(request.body.id, async function(err, invoice){
            if(err){
                console.log(err);
                response.send({
                    success :false,
                    msg: err 
                });
            }
            else if(!invoice){
                response.send({
                    success :false,
                    msg: 'Invoice not found' 
                });
            }
            else{
                var Details = createDocument(request,response,invoice);
                pdf.generateinvoice(request,response,Details);
            }
        });
    }
    
    module.exports.previewinvoicehtml = async function(request, response) {
        console.log(request.body);
        var doc = request.body.invoice;
        var Details = createDocument(request,response,doc);
        getinvoicehtml(Details, content => {
            response.send({
                content: content
            });
        })
    };
    
    function getinvoicehtml(Details, callback) {
        var req = http.request(config.domain+'/templates/PaymentInvoice.html', res => {
            var templateHtml = "";
            res.on('data', chunk => {
                templateHtml += chunk;
            });
            res.on('end', () => {
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
                  .replace('{{jurisdiction}}', Details.jurisdiction)
                  .replace('{{remark}}', Details.remark)
                  .replace('{{Address}}', Details.address)
                  .replace('{{pullout}}', Details.pullout)
                  .replace('{{caddress}}', Details.caddress)
                  .replace('{{maddress}}', Details.maddress)
                  .replace('{{premam}}', Details.premam)
                  .replace('{{medition}}', Details.medition)
                  .replace('{{phone}}', Details.phone)
                  .replace('{{email}}', Details.email);
    
                callback(templateHtml);
            });
        });
        req.on('error', e => console.log(e));
        req.end();
    }
    
    module.exports.getinvoicehtml = getinvoicehtml;

    function createDocument(request, response, doc){
        var user = response.locals.user;
        var firm = response.locals.firm;
        var result = doc.insertions.reduce((grouped, item) => {
            var index = grouped.findIndex(m => m.key.month == item.date.month
                && m.key.year == item.date.year);
                
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
                insData += '<tr><td colspan="3" rowspan='+row+'>'+caption+''+categories+''+premium+'</td><td>'+toMonth(object.key.month)+'-'+object.key.year+'<br>Dates: '+dates+'</td><td rowspan='+row+'>'+doc.adPosition+'</td><td rowspan='+row+'>'+doc.adSizeL+'x'+doc.adSizeW+'</td><td rowspan='+row+'><b>₹ '+addZeroes(""+Math.round(doc.adGrossAmount))+'</b></td></tr>';
                count = 1;
            }
            else{
                insData+='<tr><td>'+toMonth(object.key.month)+'-'+object.key.year+'<br>Dates: '+dates+'</td></tr>';
            }
        });
        
        var remark = doc.remark?doc.remark:'';
    
        var paymentDetails="";
        var address = firm.RegisteredAddress;
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
        console.log(doc);
    
    
        console.log(doc.publicationGSTIN);
    
        var Details = {
            image : config.domain+'/'+firm.LogoURL,
            mediahouse :doc.publicationName,
            medition : doc.publicationEdition,
            pgstin :'-',
            cname :doc.clientName,
            cgstin :'-',
            gstin :'-',
            scheme :doc.adSchemePaid+'+'+doc.adSchemeFree,
            insertions :insData,
            username: user.name,
            firmname: firm.FirmName,
            firmname1: firm.FirmName,
            rno : doc.docNO,
            sign: config.domain+'/'+user.signature,
            remark: doc.Remark || "",
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
            damount: '',
            agenD1: doc.agencyDiscount1,
            agenD2: doc.agencyDiscount2,
            pubD: doc.publicationDiscount,
            edition: doc.adEdition,
            adtype:doc.adType,
            hue:doc.adHue,
            address: address?(address.address+'<br>'+address.city+"<br>"+address.state+'<br>PIN code:'+address.pincode):'',
            caddress: caddress || '',
            maddress: maddress || '',
            pullout: doc.pulloutName,
            premam : "₹ "+addZeroes(""+Math.round(premam)),
            remark: remark,
            phone: "Phone: "+firm.Mobile || '',
            email: "Email: "+firm.Email || ''
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
        var taxamount = doc.netAmountFigures;
        var namount = taxamount + (taxamount*tax)/100;
        Details['taxamount'] ='₹ '+ (taxamount.toFixed(2));
        Details['namount'] ='₹ '+ (namount.toFixed(2));
        Details['namountwords'] = amountToWords(Math.round(taxamount + (taxamount*tax)/100));
    
        // if(firm.GSTIN.GSTType !== 'URD')
        //     Details['gstin'] =firm.GSTIN.GSTNo;
        // if(doc.clientGSTIN.GSTType !== 'URD')
        //     Details['cgstin'] =doc.clientGSTIN.GSTNo;
        // if(doc.publicationGSTIN.GSTType !== 'URD')
        //     Details['gstin'] =doc.publicationGSTIN.GSTNo;
    
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
    