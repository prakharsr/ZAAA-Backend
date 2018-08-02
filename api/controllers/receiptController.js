var pdf = require('./pdf');
var Firm = require('../models/Firm');
var MediaHouse = require('../models/MediaHouse');
var Executive = require('../models/Executive');
var Invoice = require('../models/Invoice');
var Client = require('../models/Client');
var Receipt = require('../models/Receipt');
var mongoose = require('mongoose');
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
                    GSTIN:request.body.GSTIN,
                    firm : user.firm
                });
                
                newMediahouse.save(function(err, doc){
                    console.log('mediahouse saved');
                    mediahouseID = newMediahouse._id;
                    resolve(mediahouseID)
                })
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
        var rno = invoice.invoiceNO+'.'+counter;  
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
        publicationName:mediahouse.PublicationName,
        publicationEdition:mediahouse.Address.edition,
        mediaType:mediahouse.MediaType,
        publicationState:mediahouse.Address.state,
        publicationGSTIN:mediahouse.GSTIN,
        executiveName:executive.ExecutiveName,
        executiveOrg:executive.OrganizationName,
        exceedingAmount: 0,
        template: firm.ROTemplate,
        firm:user.firm,
        mediahouseID : mediahouseID,
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
    var receipt = await Receipt.findById(request.body.receiptID);
    var invoice = await Invoice.findById(request.body.invoiceID);
    
    receipt.invoiceID = request.body.invoiceID;
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
        if(advanced)
        query['advanced']=advanced;
        if(request.body.userID)
        {
            query['userID'] = request.body.userID;
        }
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
        receipt.isCancelled = true;
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
                msg: 'Receipt not found' 
            });
        }
        else{
            var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
            var client = await Client.findById(receipt.clientID);
            var invoice = await Invoice.findById(receipt.invoiceID);
            var Add = firm.OfficeAddress;
            var Address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
            var Add = client.Address;
            var address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
            var cdetails = '';
            var details='';
            if(firm.Mobile) cdetails += 'MOB '+firm.Mobile;
            if(firm.OtherMobile) cdetails += ' '+firm.OtherMobile;
            if(firm.Email) cdetails += ' '+firm.Email;
            var insertions = '<tr><td>'+client.OrganizationName+'</td><td>'+invoice.InvoiceNo+'</td><td>'+receipt.paymentAmount+'</td><td></td></tr>';
            insertions+= '<tr><td>'+receipt.paymentType+'</td><td>'+'</td><td>'+'</td><td>'+receipt.p+'</td><td>';
            if(receipt.paymentType == 'NEFT'){
                details+='<p> Payment ID:'+receipt.paymentNo+'</p>\n<p> Payment Date'+ receipt.paymentDate+'</p>';
            }
            else if(receipt.paymentType == 'Cheque'){
                details+='<p> Cheque No. :'+receipt.paymentNo+'</p>\n<p> Payment Date :'+ receipt.paymentDate+'</p>\n<p> Bank :'+receipt.paymentBankName;
            }
            else{
                details+='<p> Payment Date :'+receipt.paymentDate;
            }
            
            var Details = {
                image : 'http://www.adagencymanager.com/'+firm.LogoURL,
                sign : 'http://www.adagencymanager.com/'+user.signature,
                faddress : Address,
                fcdetails : cdetails,
                cname : client.OrganizationName,
                address :address,
                rno :receipt.ReceiptNo,
                amtwords :receipt.paymentAmountWords,
                amtfig: receipt.paymentAmount,
                insertions : insertions,
                details : details
            }
            pdf.mailPaymentReceipt(request,response,Details);
        }
    })
}

module.exports.generateReceiptPdf = function(request, response) {
    var user = response.locals.user;
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
                msg: 'Receipt not found' 
            });
        }
        else{
            var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
            var client = await Client.findById(receipt.clientID);
            var invoice = await Invoice.findById(receipt.invoiceID);
            var Add = firm.OfficeAddress;
            var Address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
            var Add = client.Address;
            var address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
            var cdetails = '';
            var details='';
            if(firm.Mobile) cdetails += 'MOB '+firm.Mobile;
            if(firm.OtherMobile) cdetails += ' '+firm.OtherMobile;
            if(firm.Email) cdetails += ' '+firm.Email;
            var insertions = '<tr><td>'+client.OrganizationName+'</td><td>'+invoice.InvoiceNo+'</td><td>'+receipt.paymentAmount+'</td><td></td></tr>';
            insertions+= '<tr><td>'+receipt.paymentType+'</td><td>'+'</td><td>'+'</td><td>'+receipt.p+'</td><td>';
            if(receipt.paymentType == 'NEFT'){
                details+='<p> Payment ID:'+receipt.paymentNo+'</p>\n<p> Payment Date'+ receipt.paymentDate+'</p>';
            }
            else if(receipt.paymentType == 'Cheque'){
                details+='<p> Cheque No. :'+receipt.paymentNo+'</p>\n<p> Payment Date :'+ receipt.paymentDate+'</p>\n<p> Bank :'+receipt.paymentBankName;
            }
            else{
                details+='<p> Payment Date :'+receipt.paymentDate;
            }
            
            var Details = {
                image : 'http://www.adagencymanager.com/'+firm.LogoURL,
                sign : 'http://www.adagencymanager.com/'+user.signature,
                faddress : Address,
                fcdetails : cdetails,
                cname : client.OrganizationName,
                address :address,
                rno :receipt.ReceiptNo,
                amtwords :receipt.paymentAmountWords,
                amtfig: receipt.paymentAmount,
                insertions : insertions,
                details : details
            }
            pdf.generatePaymentReceipt(request,response,Details);
        }
    })
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
    var coamount = 0, pamount = 0, clamount = 0, amount = receipt.paymentAmount;
    
    /* 0 for collected
    1 for cleared
    2 for rejected  */
    
    if(oldStatus==0 && newStatus==1){
        coamount = invoice.collectedAmount-amount;
        pamount = invoice.pendingAmount;
        clamount = invoice.clearedAmount+amount;
    }
    else if(oldStatus==0 && newStatus==2){
        coamount = invoice.collectedAmount-amount;
        pamount = invoice.pendingAmount+amount;
        clamount = invoice.clearedAmount;
    }
    else if(oldStatus==1 && newStatus==0){
        coamount = invoice.collectedAmount+amount;
        pamount = invoice.pendingAmount;
        clamount = invoice.clearedAmount-amount;
    }
    else if(oldStatus==1 && newStatus==2){
        coamount = invoice.collectedAmount;
        pamount = invoice.pendingAmount+amount;
        clamount = invoice.clearedAmount-amount;
    }
    else if(oldStatus==2 && newStatus==0){
        coamount = invoice.collectedAmount+amount;
        pamount = invoice.pendingAmount-amount;
        clamount = invoice.clearedAmount;
    }
    else if(oldStatus==2 && newStatus==1){
        coamount = invoice.collectedAmount;
        pamount = invoice.pendingAmount-amount;
        clamount = invoice.clearedAmount+amount;
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
                "pendingAmount": pamount
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

