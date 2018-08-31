var pdf = require('./pdf');
var Firm = require('../models/Firm');
var MediaHouse = require('../models/MediaHouse');
var Executive = require('../models/Executive');
var Invoice = require('../models/Invoice');
var Client = require('../models/Client');
var Receipt = require('../models/Receipt');
var mongoose = require('mongoose');
var config = require('../../config');
var perPage=20;


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
                {firm:mongoose.mongo.ObjectId(user.firm)},
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
            else if (client.length == 0)
            {
                var newClient = new Client({
                    OrganizationName:request.body.clientName,
                    "Address.state" : request.body.clientState,
                    GSTIN : request.body.clientGSTIN,
                    firm : user.firm
                });
                newClient.save(function(err, doc){
                    var clientID = newClient._id;
                    resolve(clientID);
                })
            }
            else{
                var clientID =  client[0]._id;
                resolve(clientID);
            }
        });
    });
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
};
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
                
                resolve(null)
            }
            else{
                console.log("mediahouse found");
                mediahouseID =  mediahouse[0]._id;
                resolve(mediahouseID)
            }
        });
    })
}


function findInvoice(request, response, user){
    return new Promise((resolve, reject)=>{
        Invoice.findOne({
            $and:[
                {firm:user.firm},
                {"_id":mongoose.mongo.ObjectID(request.body.invoiceID)},
            ]
        }).exec( function(err, invoice){
            if(err){
                console.log(err)
                reject(err)
            }
            else{
                console.log(invoice);
                resolve(invoice);
            }
        });
    });
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

function findMediahouse(id){
    return new Promise((resolve, reject) => {
        console.log(id)
        MediaHouse.findById(mongoose.mongo.ObjectId(id),async function(err, mediahouse){
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
        var invoice = await findInvoice(request, response, user);
        var firm = response.locals.firm;
        var mediahouse = await findMediahouse(invoice.mediahouseID);
        var client = await findClient(invoice.clientID);
        var executive = await findExecutive(invoice.executiveID);
        var counter = invoice.receiptSerial+1;
        var rno = invoice.invoiceNO+'/'+counter;  
        var tnc ='';
        var juris = firm.Jurisdication ? firm.Jurisdication: firm.address.city;
        for(; i < firm.INterms.length; i++){
            tnc += (i+1)+'.'+firm.INterms[i]+'<br>';
        }
        tnc += (i+1)+'. All disputed are subject to '+juris+' jurisdiction only.';
    }
    catch(err){
        console.log(err);
    }
    var receipt = new Receipt({
        advanced: false,
        paymentType:request.body.paymentType,
        paymentDate:request.body.paymentDate,
        paymentNo:request.body.paymentNo,
        paymentAmount:request.body.paymentAmount,
        paymentBankName:request.body.paymentBankName,
        paymentAmountWords:request.body.paymentAmountWords,
        
        invoiceID :request.body.invoiceID,
        receiptNO: rno,
        agencyName: firm.FirmName,
        agencyGSTIN: firm.GSTIN,
        agencyPerson: user.name,
        signature: user.signature,
        clientName:client.OrganizationName,
        clientGSTIN:client.GSTIN,
        clientState:client.Address.state,
        publicationName:mediahouse.PublicationName,
        publicationEdition:mediahouse.Address.edition,
        mediaType:mediahouse.MediaType,
        publicationState:mediahouse.Address.state,
        publicationGSTIN:mediahouse.GSTIN,
        
        adGrossAmount:invoice.adGrossAmount,
        publicationDiscount:invoice.publicationDiscount,
        agencyDiscount1:invoice.agencyDiscount1,
        taxAmount:invoice.taxAmount,
        taxIncluded:invoice.taxIncluded,
        otherCharges:invoice.otherCharges,
        extraCharges:invoice.extraCharges,
        caption:invoice.caption,
        remark:invoice.remark,
        
        otherRemark:invoice.otherRemark,
        executiveName:executive.ExecutiveName,
        executiveOrg:executive.OrganizationName,
        exceedingAmount:0,
        
        template: firm.ROTemplate,
        firm:user.firm,
        userID:user._id,
        mediahouseID : invoice.mediahouseID,
        clientID: invoice.clientID,
        executiveID: invoice.executiveID,  
        faddress: firm.address,
        femail: firm.Email,
        fmobile: firm.Mobile,
        flogo: firm.LogoURL,
        fsign: user.signature,
        fjuris: juris,
        tnc: tnc
    })
    
    
    receipt.save(function(err, doc){
        if(err){
            console.log(err);
            response.send({
                success:false,
                msg: "Error! in saving Receipt" + err
            })
        }
        else{
            Invoice.update({ $and: [{firm:user.firm}, {"_id":doc.invoiceID}]},
            { $set: { "collectedAmount": invoice.collectedAmount+request.body.paymentAmount,
            "pendingAmount": invoice.pendingAmount-request.body.paymentAmount
        }}).exec(err,function(){
            if(err){
                response.send({
                    success:false,
                    msg:"Error in updating invoice details"
                });
            }
            else{
                invoice.receiptSerial += 1;
                invoice.save((err,doc) => {
                    if(err){
                        response.send({
                            success:false,
                            msg: err + ""
                        });
                    }
                    else{
                        response.send({
                            success:true,
                            msg:"Receipt saved.",
                            rceipt:doc 
                        })
                    }
                })
            }
        });
    }
});
}

module.exports.createReceipt = function(request, response){
    f(request, response, response.locals.user)
};

module.exports.createAdvancedReciept = async function(request,response){
    var user = response.locals.user;
    var firm = response.locals.firm;
    var clientID = await getClientID(request,response,user);
    var executiveID = await getExecutiveID(request,response,user);
    var mediahouseID = await getMediahouseID(request,response,user);
    var mediahouse = await findMediahouse(mediahouseID)
    var client = await findClient(clientID);
    var executive = await findExecutive(executiveID);
    var rno = 'Adv'+(firm.AdvReceiptSerial+1)
    
    var receipt = new Receipt({
        advanced: true,
        receiptNO: rno,
        paymentType:request.body.paymentType,
        paymentDate:request.body.paymentDate,
        paymentNo:request.body.paymentNo,
        paymentAmount:request.body.paymentAmount,
        paymentBankName:request.body.paymentBankName,
        paymentAmountWords:request.body.paymentAmountWords,                
        receiptNO: rno,
        agencyName: firm.FirmName,
        agencyGSTIN: firm.GSTIN,
        agencyPerson: user.name,
        signature: user.signature,
        clientName:client.OrganizationName,
        clientGSTIN:client.GSTIN,
        clientState:client.Address.state,
        publicationName:mediahouse?mediahouse.PublicationName:"",
        publicationEdition:mediahouse?mediahouse.Address.edition:"",
        mediaType:mediahouse?mediahouse.MediaType:"",
        publicationState:mediahouse?mediahouse.Address.state:"",
        publicationGSTIN:mediahouse?mediahouse.GSTIN:"",
        executiveName:executive.ExecutiveName,
        executiveOrg:executive.OrganizationName,
        exceedingAmount: 0,
        template: firm.ROTemplate,
        firm:user.firm,
        mediahouseID : mediahouse?mediahouseID:null,
        clientID: clientID,
        executiveID: executiveID
    });
    receipt.save(function(err,doc){
        if(err){
            response.send({
                success:false,
                msg:'Cannot save receipt data'
            })
        }
        else{
            firm.AdvReceiptSerial += 1;
            firm.save((err,doc) => {
                if(err){
                    response.send({
                        success:false,
                        msg:'Cannot save firm data'
                    })
                }
                else{
                    response.send({
                        success:true,
                        msg:'saved receipt data'
                    })
                }
            })
        }
    }) 
}

module.exports.linkRecieptToInvoice = async function(request,response){
    var user = response.locals.user;
    var firm = response.locals.firm;    
    var receipt = await Receipt.findById(request.body.receiptID);
    var invoice = await Invoice.findById(request.body.invoiceID);
    var tnc ='';
    var i=0;
    var juris = firm.Jurisdication ? firm.Jurisdication: firm.RegisteredAddress.city;
    for(; i < firm.INterms.length; i++){
        tnc += (i+1)+'.'+firm.INterms[i]+'<br>';
    }
    tnc += (i+1)+'. All disputed are subject to '+juris+' jurisdiction only.';
    
    receipt.invoiceID = request.body.invoiceID;
    var counter = invoice.receiptSerial+1;
    var rno = invoice.invoiceNO+'/'+counter;
    receipt.advanced = false;
    receipt.receiptNO = rno;
    receipt.adGrossAmount==invoice.adGrossAmount,
    receipt.publicationDiscount=invoice.publicationDiscount,
    receipt.agencyDiscount1=invoice.agencyDiscount1,
    receipt.taxAmount=invoice.taxAmount,
    receipt.taxIncluded=invoice.taxIncluded,
    receipt.otherCharges=invoice.otherCharges,
    receipt.extraCharges=invoice.extraCharges,
    receipt.caption=invoice.caption,
    receipt.remark=invoice.remark,
    receipt.faddress= firm.address,
    receipt.femail= firm.Email,
    receipt.fmobile= firm.Mobile,
    receipt.flogo= firm.LogoURL,
    receipt.fsign= user.signature,
    receipt.fjuris= juris,
    receipt.tnc= tnc
    receipt.save((err,doc) => {
        if(err){
            console.log(err);
            response.send({
                success:false,
                msg: "Error! in saving Receipt" + err
            })
        }
        else{
            if(receipt.paymentAmount > invoice.pendingAmount){
                Invoice.update({ $and: [{firm:user.firm}, {"_id":request.body.invoiceID}]},
                { $set: { "collectedAmount": invoice.collectedAmount+invoice.pendingAmount,
                "pendingAmount": 0,
                "exceedingAmount":receipt.paymentAmount - invoice.pendingAmount
            }}).exec(err,function(){
                if(err){
                    response.send({
                        success:false,
                        msg:"Error in updating invoice details"
                    });
                }
                else{
                    response.send({
                        success:true,
                        msg:"Receipt saved.",
                        receipt: receipt
                    });
                }
            });
        }
        else{
            Invoice.update({ $and: [{firm:user.firm}, {"_id":request.body.invoiceID}]},
            { $set: { "collectedAmount": invoice.collectedAmount + receipt.paymentAmount,
            "pendingAmount": invoice.pendingAmount - receipt.paymentAmount
        }}).exec(err,function(){
            if(err){
                response.send({
                    success:false,
                    msg:"Error in updating invoice details"
                });
            }
            else{
                response.send({
                    success:true,
                    msg:"Receipt saved.",
                    receipt: receipt
                });
            }
        });
    }
}
});
}

module.exports.getReceipt = function(request,response){
    var user = response.locals.user;  
    Receipt.findById(request.params.id,async function(err, receipt){
        if(err){
            console.log("here" +err);
            response.send({
                success:false,
                msg: err+"",
            });
        }
        else{
            try{
                var mediahouse = await findMediahouse(receipt.mediahouseID);
                var executive = await findExecutive(receipt.executiveID);
                var client = await findClient(receipt.clientID);
                var invoice = await Invoice.findById(receipt.invoiceID);
                response.send({
                    mediahouse: mediahouse,
                    client: client,
                    executive: executive,
                    success : true,
                    invoice : invoice,
                    receipt : receipt
                }); 
            }
            catch(err){
                response.send({
                    success: false,
                    msg: "Can't fetch Receipt" + err
                });
            }
        }
    });
};

module.exports.getReceipts = function(request, response){
    var user = response.locals.user;
    Receipt.find({firm:user.firm})
    .limit(perPage)
    .skip((perPage*request.params.page) - perPage)
    .sort(-'date')
    .exec(function(err, receipt){
        if(err){
            console.log("here");
            response.send({
                success:false,
                msg: err + ""
            });
        }
        else if(!receipt){
            console.log("No receipt");
            response.send({
                success:false,
                msg:" No Receipt"
            });
        }
        else{
            Receipt.count({}, function(err, count){
                response.send({
                    success : true,
                    receipt : receipt,
                    perPage:perPage,
                    page: request.params.page,
                    pageCount : Math.ceil(count/perPage)
                });
            })
        }
    });    
};

module.exports.getReceiptsForInvoice = function(request, response){
    var user = response.locals.user;
    Receipt.find({
        "firm":user.firm,
        "invoiceID": mongoose.mongo.ObjectID(request.body.invoiceID)
    })
    .sort(-'receiptNO')
    .exec(function(err, receipts){
        if(err){
            console.log("here");
            response.send({
                success:false,
                msg: err + ""
            });
        }
        else if(receipts.length ==0){
            console.log("No receipt");
            response.send({
                success:false,
                msg:" No Receipt"
            });
        }
        else{
            console.log("hi")
                response.send({
                    success : true,
                    receipts : receipts,
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

function formQuery(mediahouseID, clientID, executiveID, date, user, request, advanced){
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
        if(advanced !== undefined)
        query['advanced']=advanced == true;
        if(request.body.userID)
        {
            query['userID'] = request.body.userID;
        }
        if(request.body.status === 0||request.body.status === 1||request.body.status === 2||request.body.status === 3)
        query['status'] = request.body.status
        resolve(query);
        
    })
    
    
}

module.exports.queryReceipt = async function(request, response){
	var user = response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var executiveID = await searchExecutiveID(request, response, user);
    var date = (request.body.date)?(request.body.date):null;
    var adCategory1 = request.body.adCategory1;
    var adCategory2 = request.body.adCategory2;
    
    var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request, false);
    
    Receipt.find(query)
    .limit(perPage)
    .skip((perPage * request.body.page) - perPage)
    .sort({"createdAt": -1})
    .exec(function(err, receipt){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            Receipt.count(query, function(err, count){
                response.send({
                    success:true,
                    receipt: receipt,
                    page: request.body.page,
                    perPage:perPage,
                    pageCount: Math.ceil(count/perPage)
                });
            })
            
        }
    });    
};


module.exports.queryAdvancedReceipt = async function(request, response){
	var user = response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var executiveID = await searchExecutiveID(request, response, user);
    var date = (request.body.date)?(request.body.date):null;
    var adCategory1 = request.body.adCategory1;
    var adCategory2 = request.body.adCategory2;
    
    var query = await formQuery(mediahouseID, clientID, executiveID, date, user, request, true);
    
    Receipt.find(query)
    .limit(perPage)
    .skip((perPage * request.body.page) - perPage)
    .exec(function(err, receipt){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            Receipt.count(query, function(err, count){
                response.send({
                    success:true,
                    receipt: receipt,
                    page: request.body.page,
                    perPage:perPage,
                    pageCount: Math.ceil(count/perPage)
                });
            })
            
        }
    });
};

module.exports.deleteReceipt = async function(request, response){
	var user = response.locals.user;
    var receipt = await Receipt.findById(request.params.id);
    var invoice = await Invoice.findById(receipt.invoiceID);
    Invoice.update(
        { $and: [{firm:user.firm}, { _id : receipt.invoiceID }]
    },
    { $set: {"clearedAmount": invoice.clearedAmount-receipt.netAmountFigures,
    "pendingAmount": invoice.pendingAmount+receipt.netAmountFigures }}
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
        Receipt.findByIdAndRemove(request.params.id,function(err){
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
                    msg: "Receipt deleted"
                });
            }
            
        })
    }
})
};


module.exports.cancelReceipt = async function(request, response){
	var user = response.locals.user;
    var receipt = await Receipt.findById(request.body.id);
    var invoice = await Invoice.findById(receipt.invoiceID);
    Invoice.update(
        { $and: [{firm:user.firm}, { _id : receipt.invoiceID }]
    },
    { $set: {"clearedAmount": invoice.clearedAmount - receipt.paymentAmount,
    "pendingAmount": invoice.pendingAmount + receipt.paymentAmount }}
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
        receipt.status = 2;
        receipt.save(function(err){
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
                    msg: "Receipt Cancelled"
                });
            }
            
        })
    }            
})
};


module.exports.updateReceipt = function(request, response){
	var user = response.locals.user;
    Receipt.findByIdAndUpdate(request.params.id,{$set:request.body},function(err, receipt){
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
                msg: "receipt Updated"
            });
        }
        
    })
};

module.exports.mailReceiptPdf = function(request, response) {
    var user = response.locals.user;
    var firm = response.locals.firm;
    console.log(request.body);
    Receipt.findById(request.body.id, async function(err, receipt){
        if(err){
            console.log(err);
            response.send({
                success :false,
                msg: err 
            });
        }
        else if(!receipt){
            response.send({
                success :false,
                msg: 'Invoice not found' 
            });
        }
        else{
            var Details = createDocument(request,response,receipt);
            pdf.mailinvoice(request,response,Details);
        }
    });
}

module.exports.generateReceiptPdf = async function(request, response) {
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
    doc['flogo'] = config.domain+'/'+firm.LogoURL;
    doc['fsign'] = config.domain+'/'+user.signature;
    var juris = firm.Jurisdication ? firm.Jurisdication: firm.address.city;;
    doc['faddress'] = firm.address;
    doc['fmobile'] = firm.Mobile;
    doc['femail'] = firm.Email;
    var tnc ='';
    var i = 0;
    for(; i < firm.ROterms.length; i++){
        tnc += (i+1)+'.'+firm.ROterms[i]+'<br>';
    }
    doc['tnc'] = tnc;
tnc += (i+1)+'. All disputed are subject to '+juris+' jurisdiction only.';
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
            insData += '<tr><td colspan="3" rowspan='+row+'>'+categories+''+premium+'</td><td>'+toMonth(object.key.month)+'-'+object.key.year+'<br>Dates: '+dates+'</td><td rowspan='+row+'>'+doc.adPosition+'</td><td rowspan='+row+'>'+doc.adSizeL+'x'+doc.adSizeW+'</td><td rowspan='+row+'><b>₹ '+addZeroes(""+Math.round(doc.adGrossAmount))+'</b></td></tr>';
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
    console.log(doc);


    console.log(doc.publicationGSTIN);

    var Details = {
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
        rno : doc.invoiceNO,
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
        caddress: caddress || '',
        maddress: maddress || '',
        pullout: doc.pulloutName,
        premam : "₹ "+addZeroes(""+Math.round(premam)),
        remark: remark,
        tnc: doc.tnc,
        image : config.domain+'/'+doc.flogo,
        sign: config.domain+'/'+doc.fsign,
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


module.exports.receiptStatus = async function(request, response){
    try{
        var receipt = await Receipt.findById(request.body.receiptID);
        var invoice = await Invoice.findById(receipt.invoiceID);
    }
    catch(err){
        console.log('error in await statements');
    }
    var oldStatus = receipt.status;
    var newStatus = +(request.body.status);
    var coamount = 0, pamount = 0, saamount=0; clamount = 0, amount = receipt.paymentAmount;
    
    /* 0 for collected
    1 for cleared
    2 for rejected
    3 for shadow  */
    
    if(oldStatus==0 && newStatus==1){
        coamount = invoice.collectedAmount-amount;
        pamount = invoice.pendingAmount;
        clamount = invoice.clearedAmount+amount;
        saamount = invoice.shadowAmount;
    }
    else if(oldStatus==0 && newStatus==2){
        coamount = invoice.collectedAmount-amount;
        pamount = invoice.pendingAmount+amount;
        clamount = invoice.clearedAmount;
        saamount = invoice.shadowAmount;
    }
    else if(oldStatus==0 && newStatus==3){
        coamount = invoice.collectedAmount-amount;
        pamount = invoice.pendingAmount;
        clamount = invoice.clearedAmount;
        saamount = invoice.shadowAmount+amount;
    }
    else if(oldStatus==1 && newStatus==0){
        coamount = invoice.collectedAmount+amount;
        pamount = invoice.pendingAmount;
        saamount = invoice.shadowAmount;
        clamount = invoice.clearedAmount-amount;
    }
    else if(oldStatus==1 && newStatus==2){
        coamount = invoice.collectedAmount;
        saamount = invoice.shadowAmount;
        pamount = invoice.pendingAmount+amount;
        clamount = invoice.clearedAmount-amount;
    }
    else if(oldStatus==1 && newStatus==3){
        coamount = invoice.collectedAmount;
        saamount = invoice.shadowAmount+amount;
        pamount = invoice.pendingAmount;
        clamount = invoice.clearedAmount-amount;
    }
    else if(oldStatus==2 && newStatus==0){
        coamount = invoice.collectedAmount+amount;
        pamount = invoice.pendingAmount-amount;
        saamount = invoice.shadowAmount;
        clamount = invoice.clearedAmount;
    }
    else if(oldStatus==2 && newStatus==1){
        coamount = invoice.collectedAmount;
        pamount = invoice.pendingAmount-amount;
        clamount = invoice.clearedAmount+amount;
        saamount = invoice.shadowAmount;
    }
    else if(oldStatus==2 && newStatus==3){
        coamount = invoice.collectedAmount;
        pamount = invoice.pendingAmount-amount;
        clamount = invoice.clearedAmount;
        saamount = invoice.shadowAmount+amount;
    }
    else if(oldStatus==3 && newStatus==0){
        coamount = invoice.collectedAmount+amount;
        pamount = invoice.pendingAmount;
        saamount = invoice.shadowAmount-amount;
        clamount = invoice.clearedAmount;
    }
    else if(oldStatus==3 && newStatus==1){
        coamount = invoice.collectedAmount;
        pamount = invoice.pendingAmount;
        clamount = invoice.clearedAmount+amount;
        saamount = invoice.shadowAmount-amount;
    }
    else if(oldStatus==3 && newStatus==2){
        coamount = invoice.collectedAmount;
        pamount = invoice.pendingAmount+amount;
        clamount = invoice.clearedAmount;
        saamount = invoice.shadowAmount-amount;
    }
    
    
    receipt.status = newStatus;
    
    receipt.save((err, doc) => {
        if(err){
            response.send({
                success: false,
                msg: 'Cannot save data'
            });
        }
        else{
            Invoice.update({"_id":doc.invoiceID},
            { $set: {   
                "collectedAmount" : coamount,
                "clearedAmount": clamount,
                "pendingAmount": pamount,
                "shadowAmount": saamount
            }}).exec(err,()=>{
                if(err){
                    response.send({
                        success:false,
                        msg:"Error in updating invoice details"
                    });
                }
                else{
                    response.send({
                        success:true,
                        msg: 'Status changed successfully'
                    })
                }
            });
        }
    });
}

