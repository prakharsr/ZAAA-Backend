var config = require('../../config');
var pdf = require('./pdf');
var ReleaseOrder = require('../models/ReleaseOrder');
var Firm = require('../models/Firm');
var MediaHouse = require('../models/MediaHouse');
var MediaHouseInvoice = require('../models/MediaHouseInvoice');
var Executive = require('../models/Executive');
var Client = require('../models/Client');
var mongoose = require('mongoose');
var perPage=20;

module.exports.createMHInvoice = async (request,response) => {
    var user = response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var executiveID = await searchExecutiveID(request, response, user);
    var releaseorder = await ReleaseOrder.findById(request.body.releaseOrderId);
    var firm = await Firm.findById(user.firm)
    console.log(request.body.insertions)
    var mhinvoice = new MediaHouseInvoice({
        releaseOrderId: releaseorder._id,
        taxType: releaseorder.taxType,
        publicationName:releaseorder.publicationName,
        publicationEdition:releaseorder.publicationEdition,
        mediaType:releaseorder.mediaType,
        publicationState:releaseorder.publicationState,
        publicationGSTIN:releaseorder.publicationGSTIN,
        insertions: request.body.insertions.map(insertion => {
            return {
                ...insertion,
                _id:undefined,
                insertionId:insertion._id,
                paymentMode: releaseorder.paymentType,
                paymentDate: releaseorder.paymentDate,
                paymentNo: releaseorder.paymentNo,
                paymentAmount: releaseorder.paymentAmount,
                paymentBankName: releaseorder.paymentBankName,
            }
        }),
        releaseOrderNO: releaseorder.releaseOrderNO,
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
        if(element.paymentMode=="Cheque"||element.paymentMode=="Cash"||element.paymentMode=="NEFT")
        {
            element.collectedAmount+= amount;
            element.pendingAmount-=amount;
        }
    });
            mhinvoice.save((err,doc)=>{
                if(err){
                    response.send({
                        success: false,
                        msg: 'media house invoice cannot be created' + err
                    })
                }
                else{
                    releaseorder.insertions.filter(insertion => mhinvoice.insertions.some(ins => '' + ins.insertionId == '' + insertion._id))
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
        if(request.body.releaseOrderNO){
            query['releaseOrderNO']=request.body.releaseOrderNO
        }
        if((request.body.batchID !== undefined)&&(request.body.batchID != -1)){
            query['insertions.batchID'] = request.body.batchID;
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

module.exports.getBatchIDs = function(request, response){
    var user = response.locals.user;
    var firm = response.locals.firm;
    MediaHouseInvoice.find(
        {$and: [{firm:firm},{ 'insertions.batchID': { $regex: request.body.batchID+"", $options:"i" }}]},{"insertions.batchID":1}
    )
    .sort({"insertions.batchIDs":1})
    .exec(function(err, mhinvoices){
        if(err){
            response.send({
                success:false,
                msg:"Error in Finding BatchIDs"
            })
        }
       var invoice = [];
       mhinvoices.forEach(mhinvoice=> mhinvoice.insertions.forEach(insertion=>{
           if((invoice.indexOf(insertion.batchID >-1))&&((insertion.batchID !=null)&&(insertion.batchID !=undefined)&&(insertion.batchID !=''))){
               invoice.push(insertion.batchID)
           }
       }))
        response.send({
                success:true,
                mhinvoices: mhinvoices,
                batchIDs:invoice.filter((v, i, a) => a.indexOf(v) === i)
            })
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
        "releaseOrderNO":"$releaseOrderNO"
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
            "state":"$insertions.state",
            "_id": "$insertions._id",                   
            "MHINo":"$MHINo",
            "MHIDate":"$MHIDate",
            "MHIGrossAmount":"$MHIGrossAmount",
            "MHITaxAmount":"$MHIAmount"
        } }
    } },
    
    {$sort:{ createdAt : -1, "insertions.insertionDate": 1 }}
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
// .sort( { "MHIDate": -1,"insertions.insertionDate": 1})
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

module.exports.getMHInvoicesForRO = function(request, response){
    var user = response.locals.user;
    MediaHouseInvoice.find({
        "firm":user.firm,
        "releaseOrderId": mongoose.mongo.ObjectID(request.body.releaseOrderId)
    },{
        
    })
    .sort(-'MHINo')
    .exec(function(err, mhinvoices){
        if(err){
            console.log("here");
            response.send({
                success:false,
                msg: err + ""
            });
        }
        else if(mhinvoices.length ==0){
            console.log("No MediaHouseInvoices");
            response.send({
                success:false,
                msg:" No MediaHouseInvoices"
            });
        }
        else{
            console.log("hi")
                response.send({
                    success : true,
                    mhinvoices:mhinvoices,
            })
        }
    });    
};



module.exports.generateSummarySheet = function(request, response){
    var user = response.locals.user;
    var firm = response.locals.firm;
    try {
        var mhis = request.body.mhis; // { _id, amount: number }[]
        var batchID = new Date().toLocaleDateString().slice(-10)+firm.SSSerial;
        MediaHouseInvoice.find({ firm: user.firm }).then(invoices => {
            invoices.forEach(invoice => {
                invoice.insertions.forEach(mhiInsertion => {
                    mhis.forEach(insertion => {
                        if (mhiInsertion._id == insertion._id) {
                            mhiInsertion.collectedAmount += insertion.amount;
                            mhiInsertion.pendingAmount -=insertion.amount;
                            mhiInsertion.paymentDate =request.body.paymentDate;
                            mhiInsertion.paymentNo =request.body.paymentNo;
                            mhiInsertion.paymentMode =request.body.paymentType;
                            mhiInsertion.paymentAmount = request.body.paymentAmount
                            mhiInsertion.paymentBankName =request.body.paymentBankName;                        
                            mhiInsertion.batchID = batchID;
                            
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
    finally{
        firm.SSSerial+=1;
        firm.save(function(err){
            if(err){
                response.send({
                    success:false,
                    msg:"Error in updating SummarySheet Counter"
                })
            }
            else{
                response.send({
                    success:true,
                    msg:"done"
                })
            }
        })
    }
};


module.exports.queryMediaHouseReports =async function(request, response){
var user = response.locals.user;
var mediahouseID =await searchMediahouseID(request, response, user);
var date = (request.body.date)?(request.body.date):null;
var query = await formQuery(mediahouseID, date, user, request);       
query['insertions.paymentMode'] = {$in:["Cheque", "Cash", "NEFT"]} 
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
            "releaseOrderNO":"$releaseOrderNO",
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
                "batchID":"$insertions.batchID",

                "MHIDate":"$MHIDate",
                "MHIGrossAmount":"$MHIGrossAmount",
                "MHITaxAmount":"$MHIAmount"
            } }
        } },
        {$sort:{ updatedAt : -1, "insertions.insertionDate": 1 }}
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
    var user = resposne.locals.user;
    var firm = response.locals.firm;
    try {
        var mhis = request.body.mhis; // { _id, amount: number }[]
        var mhijson = [];
        
        MediaHouseInvoice.find({ firm: user.firm }).then(invoices => {
            invoices.forEach(invoice => {
                invoice.insertions.forEach(mhiInsertion => {
                    mhis.forEach(insertion => {
                        if (mhiInsertion._id == insertion._id) {
                            mhiInsertion.collectedAmount += insertion.amount;
                            mhiInsertion.pendingAmount -=insertion.amount;
                            mhiInsertion.paymentDate =request.body.paymentDate;
                            mhiInsertion.paymentNo =request.body.paymentNo;
                            mhiInsertion.paymentMode =request.body.paymentType;
                            mhiInsertion.paymentAmount = request.body.paymentAmount
                            mhiInsertion.paymentBankName =request.body.paymentBankName;
                            
                        }
                    });
                });
                
                invoice.save(function(err, doc) {
                    if (err) {
                        response.send({
                            success: false,
                            msg: "error" + err
                        });
                    }
                    else{
                        mhijson.push(doc);
                    }
                });
            });
            var address = firm.address;
            var Details = {
                image : config.domain+'/'+firm.LogoURL,
                sign: config.domain+'/'+user.signature,
                jurisdiction: firm.jurisdiction ? firm.jurisdiction : address.city,
                address: address?(address.address+'<br>'+address.city+"<br>"+address.state+'<br>PIN code:'+address.pincode):'',
                phone: "Phone: "+firm.Mobile || '',
                email: "Email: "+firm.Email || ''
            }
            pdf.generateSummarySheet(request, response, Details);
        });
    }
    catch (err) {
        if (err)
        console.log(err)
    }
    
}

module.exports.mailSummarySheetPdf = (request,response) => {
    try {
        var mhis = request.body.mhis; // { _id, amount: number }[]
        var mhijson = [];
        
        MediaHouseInvoice.find({ firm: user.firm }).then(invoices => {
            invoices.forEach(invoice => {
                invoice.insertions.forEach(mhiInsertion => {
                    mhis.forEach(insertion => {
                        if (mhiInsertion._id == insertion._id) {
                            mhiInsertion.collectedAmount += insertion.amount;
                            mhiInsertion.pendingAmount -=insertion.amount;
                            mhiInsertion.paymentDate =request.body.paymentDate;
                            mhiInsertion.paymentNo =request.body.paymentNo;
                            mhiInsertion.paymentMode =request.body.paymentType;
                            mhiInsertion.paymentAmount = request.body.paymentAmount
                            mhiInsertion.paymentBankName =request.body.paymentBankName;
                            
                        }
                    });
                });
                invoice.save(function(err, doc) {
                    if (err) {
                        response.send({
                            success: false,
                            msg: "error" + err
                        });
                    }
                    else{
                        mhijson.push(doc);
                    }
                });
            });
            var address = firm.address;
            var Details = {
                image : config.domain+'/'+firm.LogoURL,
                sign: config.domain+'/'+user.signature,
                jurisdiction: firm.jurisdiction ? firm.jurisdiction : address.city,
                address: address?(address.address+'<br>'+address.city+"<br>"+address.state+'<br>PIN code:'+address.pincode):'',
                phone: "Phone: "+firm.Mobile || '',
                email: "Email: "+firm.Email || ''
            }
            pdf.mailSummarySheet(request, response, Details);
        });
    }
    catch (err) {
        if (err)
        console.log(err)
    }
}
