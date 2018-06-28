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
var Receipt = require('../models/Receipt');
var MediaHouseInvoice = require('../models/MediaHouseInvoice');
var MediaHouseNotes = require('../models/MediaHouseNotes');
var ClientNotes = require('../models/ClientNotes');
var Executive = require('../models/Executive');
var Client = require('../models/Client');
var mongoose = require('mongoose');
var multer = require('multer');
var mkdirp = require('mkdirp');
var path = require('path');
var perPage = 20;

var XLSX = require('xlsx');
var base64 = require('base64-stream');
var stream = require('stream');


module.exports.mediahouseReports = function (request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token, request, response, async function (err, user) {
        if (err) {
            console.log(err);
            response.send({
                success: false,
                msg: err
            });
        }
        else if (!user) {
            console.log("User not found");
            response.send({
                success: false,
                msg: "User not found, Please Login"
            });
        }
        else {
            var query = { "firm": user.firm }
            if (request.body.creationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.creationPeriod * 24 * 60 * 60 * 1000);
                query['createdAt'] = { $gte: from, $lte: to }
            }
            if (request.body.updationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.updationPeriod * 24 * 60 * 60 * 1000);
                query['updatedAt'] = { $gte: from, $lte: to }
            }
            
            MediaHouse.find(query, function (err, mediahouses) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    try {
                        var el = mediahouses.map(function (mediahouse) {
                            var obj = {
                                "Publication Name": mediahouse.PublicationName ? mediahouse.PublicationName : "-",
                                "Organization Name": mediahouse.OrganizationName ? mediahouse.OrganizationName : "-",
                                "Nick Name": mediahouse.NickName ? mediahouse.NickName : "-",
                                "Media Type": mediahouse.MediaType ? mediahouse.MediaType : "-",
                                "Language": mediahouse.Language ? mediahouse.Language : "-",
                                "PIN": mediahouse.Address.pincode ? mediahouse.Address.pincode : "-",
                                "Edition": mediahouse.Address.edition?mediahouse.Address.edition:"-",
                                "City": mediahouse.Address.city?mediahouse.Address.city:"-",
                                "State": mediahouse.Address.state?mediahouse.Address.state:"-",
                                "Phone": mediahouse.OfficeLandline.std + '-' + mediahouse.OfficeLandline.phone,
                                "GSTIN": mediahouse.GSTIN.GSTType + '-' + (mediahouse.GSTIN.GSTNo ? mediahouse.GSTIN.GSTNo : "-"),
                                "Remark": mediahouse.Remark
                            }
                            if(mediahouse.pullouts.length > 0)
                            {
                                for (var i = 0; i < mediahouse.pullouts.length && i < 2; ++i) {
                                    var index = +i + 1
                                    var pullout = mediahouse.pullouts[i];
                                    obj["Pullout" + index] = pullout.Name?pullout.Name:"-";
                                    obj["PulloutLanguage" + index] = pullout.Language?pullout.Language:"-";
                                    obj["PulloutFrequency" + index] = pullout.Frequency?pullout.Frequency:"-";
                                    obj["PulloutRemark" + index] = pullout.Remark?pullout.Remark:"-";
                                }
                            }
                            if(mediahouse.Scheduling.length > 0)
                            {
                                for (var i = 0; i < mediahouse.Scheduling.length && i < 2; ++i) {
                                    var index = +i + 1
                                    var scheduling = mediahouse.Scheduling[i];
                                    obj["PersonName" + index] = scheduling.Name?scheduling.Name:"-";
                                    obj["Designation" + index] = scheduling.Designation?scheduling.Designation:"-";
                                    obj["Mobile" + index] = scheduling.MobileNo?scheduling.MobileNo:"-";
                                    obj["DeskExtension" + index] = scheduling.DeskExtension?scheduling.DeskExtension:"-";
                                    obj["Email" + index] = scheduling.EmailId?scheduling.EmailId:"-";
                                    obj["Department"] = scheduling.Departments[0]?scheduling.Departments[0]:"-";
                                }
                            }
                            return obj;
                        })
                    }
                    catch (err) {
                        console.log(err)
                    }
                    createSheet(el, request, response, 'MediaHouseExportData', 'excelReport');
                }
            })
            
        }
    });
    
};

module.exports.clientReports = function (request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token, request, response, async function (err, user) {
        if (err) {
            console.log(err);
            response.send({
                success: false,
                msg: err
            });
        }
        else if (!user) {
            console.log("User not found");
            response.send({
                success: false,
                msg: "User not found, Please Login"
            });
        }
        else {
            var query = { "firm": user.firm }
            if (request.body.creationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.creationPeriod * 24 * 60 * 60 * 1000);
                query['createdAt'] = { $gte: from, $lte: to }
            }
            if (request.body.updationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.updationPeriod * 24 * 60 * 60 * 1000);
                query['updatedAt'] = { $gte: from, $lte: to }
            }
            
            Client.find(query, function (err, clients) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    try {
                        var el = clients.map(function (client) {
                            var obj =  {
                                "Organization Name": client.OrganizationName ? client.OrganizationName : "-",
                                "Nick Name": client.NickName ? client.NickName : "-",
                                "Company Name": client.CompanyName ? client.CompanyName : "-",
                                "Category": client.CategoryType ? client.CategoryType : "-",
                                "Sub Category": client.SubCategoryType ? client.SubCategoryType : "-",
                                "PIN": client.Address.pincode ? client.Address.pincode : "-",
                                "City": client.Address.city,
                                "Address": client.Address.address,
                                "State": client.Address.state,
                                "Phone": client.stdNo + '-' + client.Landline,
                                "Website": client.Website,
                                "PAN": client.PanNO,
                                "GSTIN": client.GSTIN.GSTType + '-' + (client.GSTIN.GSTNo ? client.GSTIN.GSTNo : "-"),
                                "Remark": client.Remark,
                            }
                            if( client.ContactPerson !==undefined && client.ContactPerson.length> 0){
                                var index;
                                for(var i = 0; i< client.ContactPerson.length && i < 2; ++i){
                                    index = i+1;
                                    var contactPerson = client.ContactPerson[i];
                                    obj["Person Name" + index] = contactPerson.Name;
                                    obj["Person Designation" + index] = contactPerson.Designation;
                                    obj["Person Department" + index] = contactPerson.Department;
                                    obj["Person Mobile" + index] = contactPerson.MobileNo;
                                    obj["Person Phone" + index] = contactPerson.stdNo + "-" + contactPerson.Landline;
                                    obj["Person Email" + index] = contactPerson.EmailId;
                                    obj["Person DOB" + index] = contactPerson.DateOfBirth;
                                    obj["Person Anniversary" + index] = contactPerson.Anniversary;
                                }
                            }
                            return obj
                        })
                    }
                    catch (err) {
                        console.log(err)
                    }
                    createSheet(el, request, response, 'ClientsExportData', 'excelReport');
                }
            })
            
        }
    });
    
};

module.exports.executiveReports = function (request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token, request, response, async function (err, user) {
        if (err) {
            console.log(err);
            response.send({
                success: false,
                msg: err
            });
        }
        else if (!user) {
            console.log("User not found");
            response.send({
                success: false,
                msg: "User not found, Please Login"
            });
        }
        else {
            var query = { "firm": user.firm }
            if (request.body.creationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.creationPeriod * 24 * 60 * 60 * 1000);
                query['createdAt'] = { $gte: from, $lte: to }
            }
            if (request.body.updationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.updationPeriod * 24 * 60 * 60 * 1000);
                query['updatedAt'] = { $gte: from, $lte: to }
            }
            
            Executive.find(query, function (err, executives) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    try {
                        var el = executives.map(function (executive) {
                            return {
                                "Executive Name": executive.ExecutiveName ? executive.ExecutiveName : "-",
                                "Organization Name": executive.OrganizationName ? executive.OrganizationName : "-",
                                "Designation": executive.Designation ? executive.Designation : "-",
                                "Departmet": executive.Department ? executive.Department : "-",
                                "MobileNo": executive.MobileNo,
                                "Email": executive.EmailId,
                                "DOB": executive.DateOfBirth,
                                "Anniversary": executive.Anniversary,
                                "Remark": executive.Remark,
                            }
                        })
                    }
                    catch (err) {
                        console.log(err)
                    }
                    createSheet(el, request, response, 'ExecutiveExportData', 'excelReport');
                }
            })
            
        }
    });
    
};

module.exports.releaseOrderReports = function (request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token, request, response, async function (err, user) {
        if (err) {
            console.log(err);
            response.send({
                success: false,
                msg: err
            });
        }
        else if (!user) {
            console.log("User not found");
            response.send({
                success: false,
                msg: "User not found, Please Login"
            });
        }
        else {
            var query = { "firm": user.firm }
            if (request.body.creationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.creationPeriod * 24 * 60 * 60 * 1000);
                query['createdAt'] = { $gte: from, $lte: to }
            }
            if (request.body.updationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.updationPeriod * 24 * 60 * 60 * 1000);
                query['updatedAt'] = { $gte: from, $lte: to }
            }
            
            ReleaseOrder.find(query, async function (err, releaseOrders) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    try {
                        var el = releaseOrders.map(function (releaseOrder) {
                            var obj =  {
                                "RO No.":releaseOrder.releaseOrderNO?releaseOrder.releaseOrderNO:"-",
                                "RO Date":releaseOrder.createdAt?releaseOrder.createdAt.toLocaleDateString():"-",
                                "Mediahouse Name": releaseOrder.publicationName ? releaseOrder.publicationName : "-",
                                "Edition": releaseOrder.publicationEdition ? releaseOrder.publicationEdition : "-",
                                "Media Type": releaseOrder.mediaType ? releaseOrder.mediaType : "-",
                                "Pullout Name":releaseOrder.PulloutName?releaseOrder.PulloutName:"-",
                                "Mediahouse State": releaseOrder.publicationState ? releaseOrder.publicationState : "-",
                                "Mediahouse GSTIN": releaseOrder.publicationGSTIN.GSTType +"-"+ releaseOrder.publicationGSTIN.GSTNo,
                                "Client Name": releaseOrder.clientName?releaseOrder.clientName:"-",
                                "Client State": releaseOrder.clientState?releaseOrder.clientState:"-",
                                "Client GSTIN": releaseOrder.clientGSTIN.GSTType + "-" +releaseOrder.clientGSTIN.GSTNo,
                                "Ad Type": releaseOrder.adType?releaseOrder.adType:"-",
                                "Publish Edition":releaseOrder.publicationEdition?releaseOrder.publicationEdition:"-",
                                "Rate": releaseOrder.rate?releaseOrder.rate:"-",
                                "unit": releaseOrder.unit?releaseOrder.unit:"-",
                                "Category1":releaseOrder.adCategory1?releaseOrder.adCategory1:"-",
                                "Category2":releaseOrder.adCategory2?releaseOrder.adCategory2:"-",
                                "Category3":releaseOrder.adCategory3?releaseOrder.adCategory3:"-",
                                "Category4":releaseOrder.adCategory4?releaseOrder.adCategory4:"-",
                                "Category5":releaseOrder.adCategory5?releaseOrder.adCategory5:"-",
                                "Category6":releaseOrder.adCategory6?releaseOrder.adCategory6:"-",
                                "Hue":releaseOrder.adHue?releaseOrder.adHue:"-",
                                "Caption":releaseOrder.Caption?releaseOrder.Caption:"-",
                                
                                "Words/Line":releaseOrder.AdWords?releaseOrder.AdWords:"-",
                                "Size":releaseOrder.adSizeL + "x"+ releaseOrder.adSizeW,
                                "Time":releaseOrder.adTime?releaseOrder.adTime:"-",
                                "Position":releaseOrder.adPosotion?releaseOrder.adPosotion:"-",
                                "Scheme-Paid":releaseOrder.adSchemePaid?releaseOrder.adSchemePaid:"-",
                                "Scheme-Free":releaseOrder.adSchemeFree?releaseOrder.adSchemeFree:"-",
                                "Remark": releaseOrder.Remark,
                                "Gross Amount": releaseOrder.adGrossAmount?releaseOrder.adGrossAmount:"-",     
                                "Payment Type":releaseOrder.paymentType,
                                "Payment Date":releaseOrder.paymentDate,
                                "Payment No":releaseOrder.paymentNo,
                                "Payment Amount":releaseOrder.paymentAmount,
                                "Payment BankName": releaseOrder.paymentBankName,
                            }
                            if(releaseOrder.PremiumBox.Included){
                                
                            }
                            if(releaseOrder.insertions.length> 0){
                                var insertionString=""
                                for(var i = 0; i< releaseOrder.insertions.length && i < 10; ++i){
                                    insertion = releaseOrder.insertions[i];
                                    insertionString += insertion.ISODate.toLocaleDateString() + ", ";
                                }
                                obj["Insertions"] = insertionString;
                            }
                            
                            obj["Publication Discount"] = releaseOrder.publicationDiscount;
                            obj["Agency Discount 1"] = releaseOrder.agencyDiscount1;
                            obj["Agency Discount 2"] = releaseOrder.agencyDiscount2;
                            obj["Total Discount"] = +releaseOrder.publicationDiscount + +releaseOrder.agencyDiscount1 + +releaseOrder. agencyDiscount2;
                            obj["Tax"] = +releaseOrder.taxAmount.primary + +releaseOrder.taxAmount.secondary;
                            obj["Tax Amount"] = ((+releaseOrder.taxAmount.primary + +releaseOrder.taxAmount.secondary) * (+releaseOrder.adGrossAmount/100));
                            obj["Net Amount"] = "to be calculated";
                            obj["Executive Name"] = releaseOrder.executiveName?releaseOrder.executiveName:"-";
                            obj["Executive Org."] = releaseOrder.executiveOrg?releaseOrder.executiveOrg:"-";
                            obj["Tax included"]  =releaseOrder.taxIncluded;
                            obj["Remark"]  = releaseOrder.remark?releaseOrder.remark:"-";
                            obj["Status"] = releaseOrder.cancelled?"Cancelled":"Active";
                            return obj
                        })
                    }
                    catch (err) {
                        console.log(err)
                    }
                    createSheet(el, request, response, 'ReleaseOrderExportData', 'excelReport');
                }
            })
            
        }
    });
    
};

module.exports.clientInvoiceReports = function (request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token, request, response, async function (err, user) {
        if (err) {
            console.log(err);
            response.send({
                success: false,
                msg: err
            });
        }
        else if (!user) {
            console.log("User not found");
            response.send({
                success: false,
                msg: "User not found, Please Login"
            });
        }
        else {
            var query = { "firm": user.firm }
            if (request.body.creationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.creationPeriod * 24 * 60 * 60 * 1000);
                query['createdAt'] = { $gte: from, $lte: to }
            }
            if (request.body.updationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.updationPeriod * 24 * 60 * 60 * 1000);
                query['updatedAt'] = { $gte: from, $lte: to }
            }
            
            Invoice.find(query, function (err, invoices) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    try{
                        var el = invoices.map(function (invoice) {
                            var obj =  {
                                "Invoice Number": invoice.invoiceNO? invoice.invoiceNO : "-",
                                "Date": invoice.date ? invoice.date.toLocaleDateString() : "-",
                                "Mediahouse Name": invoice.publicationName ? invoice.publicationName : "-",
                                "Edition": invoice.publicationEdition ? invoice.publicationEdition : "-",
                                "Media Type": invoice.mediaType ? invoice.mediaType : "-",
                                "RO No.":invoice.invoiceNO,
                                // "Mediahouse State": invoice.publicationState ? invoice.publicationState : "-",
                                // "Mediahouse GSTIN": invoice.publicationGSTIN.GSTType +"-"+ invoice.publicationGSTIN.GSTNo,
                                "Client Name": invoice.clientName?invoice.clientName:"-",
                                "Client State": invoice.clientState?invoice.clientState:"-",
                                "Client GSTIN": invoice.clientGSTIN.GSTType + "-" +invoice.clientGSTIN.GSTNo,
                                "Gross Amount":invoice.adGrossAmount?invoice.adGrossAmount:"-",
                                "Publication Discount":invoice.publicationDiscount?invoice.publicationDiscount:"-",
                                "Agency Discount1":invoice.agencyDiscount1?invoice.agencyDiscount1:"-",
                                "Agency Discount2":invoice.agencyDiscount2?invoice.agencyDiscount2:"-",
                                "Extra Charges":invoice.extraCharges?invoice.extraCharges:"-",
                                "Final Gross Amount":"to be calculated",
                                "GSTIN":invoice.taxAmount?+invoice.taxAmount.primary + +invoice.taxAmount.secondary:"-",
                                "GSTIN Included":invoice.taxIncluded?invoice.taxIncluded:"-",
                                "Tax Amount":invoice.FinalTaxAmount,
                                "Final Net Amount":invoice.netAmountFigures?invoice.netAmountFigures:"-",
                                
                            }
                            if(invoice.otherCharges.length> 0){
                                var index;
                                var index = +i + 1
                                var otherCharge = invoice.otherCharges[i];
                                var otherChargesString = "";
                                for(var i = 0; i< otherCharge.length && i < 8; ++i){
                                    index = i+1;
                                    otherChargesString += "Type-"+ otherCharge.chargeType +" Amount- "+otherCharge.amount +", ";
                                } 
                                obj["Other Charges"] =otherChargesString;
                            }
                            if(invoice.insertions.length> 0){
                                var insertionString="";
                                for(var i = 0; i< invoice.insertions.length && i < 8; ++i){
                                    
                                    var insertion = invoice.insertions[i];
                                    insertionString += insertion.date.day + "/"+insertion.date.month+"/"+insertion.date.year+", ";
                                } 
                                obj["Insertions"] = insertionString;
                                obj["Executive Name"]= invoice.executiveName?invoice.executiveName:"-";
                                obj["Executive Organization"]=invoice.executiveOrg?invoice.executiveOrg:"-";
                                obj["Remark"] = invoice.remark?invoice.remark:"-";
                            }
                            return obj
                        })
                    }
                    catch (err) {
                        console.log(err)
                    }
                    
                    createSheet(el, request, response, 'ClientInvoiceExportData', 'excelReport');
                }
            })
            
        }
    });
    
};

function findInvoice(invoiceNO, user){
    return new Promise((resolve, reject) => {
        var index =invoiceNO.indexOf('.',invoiceNO.indexOf('.')+1);
        var substring = invoiceNO.slice(0,index);
        Invoice.find({
            $and:[{"firm":user.firm},{"invoiceNO":substring}]
        }).exec(function(err, invoice){
            if(err){
                console.log(err)
                reject(err)
            }
            else if(invoice.length == 0)
            {
                resolve(null);
            }
            else{
                resolve(invoice[0]);
            }
        })
    })
}

function findReleaseOrder(releaseOrderId, user){
    return new Promise((resolve, reject) => {
        ReleaseOrder.find({
            $and:[{"firm":user.firm}]
        }).exec(function(err, releaseOrder){
            if(err){
                console.log(err)
                reject(err)
            }
            else if(releaseOrder.length == 0)
            {
                console.log("A");
                resolve(null);
            }
            else{
                
                console.log("As");
                resolve(releaseOrder[0]);
            }
        })
    })
}
module.exports.receiptReports = function (request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token, request, response, async function (err, user) {
        if (err) {
            console.log(err);
            response.send({
                success: false,
                msg: err
            });
        }
        else if (!user) {
            console.log("User not found");
            response.send({
                success: false,
                msg: "User not found, Please Login"
            });
        }
        else {
            var query = { "firm": user.firm }
            if (request.body.creationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.creationPeriod * 24 * 60 * 60 * 1000);
                query['createdAt'] = { $gte: from, $lte: to }
            }
            if (request.body.updationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.updationPeriod * 24 * 60 * 60 * 1000);
                query['updatedAt'] = { $gte: from, $lte: to }
            }
            
            Receipt.find(query, async function (err, receipts) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    try{
                        var el =await Promise.all(receipts.map( async function (receipt) {
                            var invoice = await findInvoice(receipt.receiptNO, user);
                            
                            var obj =  {
                                "Receipt Number": receipt.receiptNO? receipt.receiptNO : "-",
                                "Reciept Date": receipt.date ? receipt.date.toLocaleDateString() : "-",
                                "RO No.": receipt.receiptNO? receipt.receiptNO : "-",
                                "Mediahouse Name": receipt.publicationName ? receipt.publicationName : "-",
                                "Edition": receipt.publicationEdition ? receipt.publicationEdition : "-",
                                "Client Name": receipt.clientName?receipt.clientName:"-",
                                "Client State": receipt.clientState?receipt.clientState:"-",
                                "Invoice No": receipt.receiptNO? receipt.receiptNO : "-",
                                "Invoice Date": new Date().toLocaleDateString(),
                                "Executive Name": receipt.executiveName?receipt.executiveName:"-",
                                "Executive Organization":receipt.executiveOrg?receipt.executiveOrg:"-",
                                "Invoice Gross Amount":invoice.netAmountFigures?invoice.netAmountFigures:"-",
                                "Payment Type":receipt.paymentType,
                                "Payment Date":receipt.paymentDate,
                                "Payment No":receipt.paymentNo,
                                "Payment Amount":receipt.paymentAmount,
                                "Payment BankName": receipt.paymentBankName,
                            }
                            if(receipt.otherCharges.length> 0){
                                var index;
                                var otherChargesString="";
                                for(var i = 0; i< receiptotherCharge.length && i < 8; ++i){
                                    var otherCharge = receipt.otherCharges[i];
                                    otherChargesString+= "Type- "+otherCharge.chargeType+" Amount- "+ otherCharge.amount+", ";
                                } 
                                obj["Other Charges"] = otherChargesString;
                            }
                            var paymentStatus="";
                            if(receipt.status==0)
                            paymentStatus = "Collected";
                            if(receipt.status==1)
                            paymentStatus = "Received";
                            if(receipt.status==2)
                            paymentStatus = "Rejected";
                            
                            obj["Payment Status"] = paymentStatus;
                            return obj
                        }))
                    }
                    catch (err) {
                        console.log(err)
                    }
                    
                    createSheet(el, request, response, 'ReceiptExportData', 'excelReport');
                }
            })
            
        }
    });
    
};

module.exports.mediahouseInvoiceReports = function (request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token, request, response, async function (err, user) {
        if (err) {
            console.log(err);
            response.send({
                success: false,
                msg: err
            });
        }
        else if (!user) {
            console.log("User not found");
            response.send({
                success: false,
                msg: "User not found, Please Login"
            });
        }
        else {
            var query = { "firm": user.firm }
            if (request.body.creationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.creationPeriod * 24 * 60 * 60 * 1000);
                query['createdAt'] = { $gte: from, $lte: to }
            }
            if (request.body.updationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.updationPeriod * 24 * 60 * 60 * 1000);
                query['updatedAt'] = { $gte: from, $lte: to }
            }
            
            
            MediaHouseInvoice
            .aggregate([{$unwind: "$insertions"}, 
            {$match:query },
            {$project: {
                "_id":1,    
                "publicationName":1,
                "publicationEdition":1,
                "mediaType":1,
                "publicationState":1,
                "publicationGSTIN.GSTType":1,
                "publicationGSTIN.GSTNo":1,
                "insertions.insertionDate": 1,
                "insertions.Amount":1,
                "insertions.collectedAmount":1,
                "insertions.pendingAmount":1,
                "insertions.recieptNumber":1,
                "insertions.recieptDate":1,
                "insertions.paymentMode":1,
                "date":1,
                "releaseOrderNo":1,
                "MHINo":1,
                "MHIDate": 1,
                "MHIGrossAmount":1,
                "MHITaxAmount":1,
            }
        }
    ])
    .exec(async function (err, mhinvoices) {
        if (err) {
            console.log(err + "");
            response.send({
                success: false,
                msg: err + ""
            });
        }
        else {                 
            try{
                var el = await Promise.all(mhinvoices.map( async function(mhinvoice){
                    
                    
                    var releaseOrder = await findReleaseOrder(mhinvoice.releaseOrderId, user);
                    console.log(releaseOrder);
                    var obj = {
                        "RO No":releaseOrder.releaseOrderNO,
                        "RO Date":releaseOrder.generatedAt?releaseOrder.generatedAt.toLocaleDateString():"-",
                        "Mediahouse Name":mhinvoice.publicationName,
                        "Edition":mhinvoice.publicationEdition,
                        "Client Name":releaseOrder.clientName,
                        "Insertion Date":mhinvoice.insertions.insertionDate.toLocaleDateString(),
                        "Net RO Amount":mhinvoice.insertions.Amount,
                        "Invoice No.":mhinvoice.MHINo,
                        "Invoice Amount":mhinvoice.MHIGrossAmount,
                        "Invoice Tax":mhinvoice.MHITaxAmount,
                        "Invoice Gross Amount": mhinvoice.MHIGrossAmount + mhinvoice.MHITaxAmount,
                        "Invoice Date": mhinvoice.MHIDate,
                        "Paid":mhinvoice.insertions.collectedAmount,
                        "Balance Amount":mhinvoice.insertions.pendingAmount,
                        "Receipt No":mhinvoice.insertions.receiptNumber,
                        "Receipt Date": mhinvoice.insertions.receiptDate,
                        "Payment Mode": mhinvoice.insertions.paymentMode
                    };
                    return obj;
                })
            )
            createSheet(el, request, response, 'MediahouseInvoiceExportData', 'excelReport');
        }
        catch(err){
            console.log(err);
        }
        
    }
})

}
});

};

module.exports.mediahouseNoteReports = function (request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token, request, response, async function (err, user) {
        if (err) {
            console.log(err);
            response.send({
                success: false,
                msg: err
            });
        }
        else if (!user) {
            console.log("User not found");
            response.send({
                success: false,
                msg: "User not found, Please Login"
            });
        }
        else {
            var query = { "firm": user.firm }
            if (request.body.creationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.creationPeriod * 24 * 60 * 60 * 1000);
                query['createdAt'] = { $gte: from, $lte: to }
            }
            if (request.body.updationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.updationPeriod * 24 * 60 * 60 * 1000);
                query['updatedAt'] = { $gte: from, $lte: to }
            }
            
            MediaHouseNotes.find(query, function (err, mhnotes) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    
                    try {
                        var el = mhnotes.map(function (mhnote) {
                            var obj =  {
                                "Publication Name": mhnote.publicationName?mhnote.publicationName:"-",
                                "Publication State": mhnote.publicationState?mhnote.publicationState:'-',
                                "RO Number":mhnote.releaseOrderNO?mhnote.releaseOrderNO:"-",
                                "Date":mhnote.date.month?mhnote.date.month:"-" + "/"+mhnote.date.day?mhnote.date.day:"-" + "/" +mhnote.date.year?mhnote.date.year:"-",
                                "Amount": mhnote.amount?mhnote.amount:"-",
                                "Remark": mhnote.amount
                                
                                
                            }
                            return obj
                        })
                    }
                    catch (err) {
                        console.log(err)
                    }
                    createSheet(el, request, response, 'MediahouseNoteExportData', 'excelReport');
                }
            })
            
        }
    });
    
};
module.exports.clientNoteReports = function (request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token, request, response, async function (err, user) {
        if (err) {
            console.log(err);
            response.send({
                success: false,
                msg: err
            });
        }
        else if (!user) {
            console.log("User not found");
            response.send({
                success: false,
                msg: "User not found, Please Login"
            });
        }
        else {
            var query = { "firm": user.firm }
            if (request.body.creationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.creationPeriod * 24 * 60 * 60 * 1000);
                query['createdAt'] = { $gte: from, $lte: to }
            }
            if (request.body.updationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.updationPeriod * 24 * 60 * 60 * 1000);
                query['updatedAt'] = { $gte: from, $lte: to }
            }
            
            ClientNotes.find(query, function (err, clnotes) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    
                    try {
                        var el = clnotes.map(function (clnote) {
                            var obj =  {
                                "Client Name": clnote.clientName?clnote.clientName:"-",
                                "Invoice Number": clnote.invoiceNO?clnote.invoiceNO:'-',
                                "Date":clnote.date.month?clnote.date.month:"-" + "/"+clnote.date.day?clnote.date.day:"-" + "/" +clnote.date.year?clnote.date.year:"-",
                                "Amount": clnote.amount?clnote.amount:"-",
                                "Remark": clnote.amount
                            }
                            return obj
                        })
                    }
                    catch (err) {
                        console.log(err)
                    }
                    
                    createSheet(el, request, response, 'ClientNoteExportData', 'excelReport');
                }
            })
            
        }
    });
    
};

module.exports.ratecardReports = function (request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token, request, response, async function (err, user) {
        if (err) {
            console.log(err);
            response.send({
                success: false,
                msg: err
            });
        }
        else if (!user) {
            console.log("User not found");
            response.send({
                success: false,
                msg: "User not found, Please Login"
            });
        }
        else {
            var query = { "firm": user.firm }
            if (request.body.creationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.creationPeriod * 24 * 60 * 60 * 1000);
                query['createdAt'] = { $gte: from, $lte: to }
            }
            if (request.body.updationPeriod != 0) {
                var to = new Date()
                var from = new Date(to.getTime() - request.body.updationPeriod * 24 * 60 * 60 * 1000);
                query['updatedAt'] = { $gte: from, $lte: to }
            }
            
            RateCard.find(query, async function (err, ratecards) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    try {
                        var el = ratecards.map(function(ratecard){
                            var obj = {
                                "Mediahouse Name": ratecard.BookingCenter.MediaHouseName ?ratecard.BookingCenter.MediaHouseName : "-",
                                "Edition": ratecard.BookingCenter.Edition?ratecard.BookingCenter.Edition:"-",
                                "Pullout Name":ratecard.BookingCenter.PulloutName?ratecard.BookingCenter.PulloutName:"-",
                                "Media Type": ratecard.mediaType ? ratecard.mediaType : "-",
                                "Ad Type": ratecard.AdType?ratecard.AdType:"-",
                                "Ad time":ratecard.AdTime?ratecard.AdTime:"-",
                                "Ratecard Type":ratecard.RateCardType,
                                "Words": ratecard.AdWords?ratecard.AdWords:"-",
                                "Max Words": ratecard.AdWordsMax?ratecard.AdWordsMax:"-",
                                "Category Main":ratecard.Category.Main?ratecard.Category.Main:"-",
                                "SubCategory1":ratecard.Category.SubCategory1?ratecard.Category.SubCategory1:"-",
                                "SubCategory2":ratecard.Category.SubCategory2?ratecard.Category.SubCategory2:"-",
                                "SubCategory3":ratecard.Category.SubCategory3?ratecard.Category.SubCategory3:"-",
                                "SubCategory4":ratecard.Category.SubCategory4?ratecard.Category.SubCategory4:"-",
                                "SubCategory5":ratecard.Category.SubCategory5?ratecard.Category.SubCategory5:"-",
                                "SubCategory6":ratecard.Category.SubCategory6?ratecard.Category.SubCategory6:"-",
                                "Hue":ratecard.Hue?ratecard.Hue:"-",
                                "Rate":ratecard.Rate.rateQuantity + "-" + ratecard.Rate.unit+"-"+ ratecard.Rate.unitQuantity,
                                "Position":ratecard.Posotion?ratecard.Posotion:"-",
                                "Maximum Size":ratecard.MaxSizeLimit?ratecard.MaxSizeLimit.Length +" x "+ratecard.MaxSizeLimit.Width:"-",
                                "Minimum Size":ratecard.MinSizeLimit?ratecard.MinSizeLimit.Length +" x "+ratecard.MinSizeLimit.Width:"-",
                                
                            }
                            if(ratecard.FixSize.length> 0){
                                var index;
                                for(var i = 0; i< ratecard.FixSize.length && i < 10; ++i){
                                    index = i+1;
                                    var fixsize = ratecard.FixSize[i];
                                    obj["FixSize" + index] = fixsize.Length + " x "+fixsize.Width + " - "+fixsize.Amount;
                                }
                            }
                            if(ratecard.Scheme.length> 0){
                                var index;
                                for(var i = 0; i< ratecard.Scheme.length && i < 10; ++i){
                                    index = i+1;
                                    var scheme = ratecard.Scheme[i];
                                    obj["Scheme" + index] = scheme.paid + "-Paid "+scheme.Free + "-Free "+scheme.Amount+"-Time limit";
                                }
                            }
                            
                            obj["PremiumCustom"]=ratecard.PremiumCustom?ratecard.PremiumCustom.PremiumType+"-"+ratecard.PremiumCustom.Amount+"-"+(ratecard.PremiumCustom.Percentage?"%":"Rs."):"-";
                            obj["PremiumBox"]=ratecard.PremiumBox?ratecard.PremiumBox:"-";
                            obj["PremiumBaseColour"]=ratecard.PremiumBaseColour?ratecard.PremiumBaseColour:"-";
                            obj["PremiumCheckMark"]=ratecard.PremiumCheckMark?ratecard.PremiumCheckMark:"-";
                            obj["PremiumEmail"]=ratecard.PremiumEmailId?ratecard.PremiumEmailId:"-";
                            obj["PremiumWebsite"]=ratecard.PremiumWebsite?ratecard.PremiumWebsite:"-";
                            obj["PremiumExtraWords"]=ratecard.PremiumExtraWords?ratecard.PremiumExtraWords:"-";
                            obj["Validity"]=ratecard.ValidFrom?"From "+ratecard.ValidFrom+"-"+"Upto "+ratecard.ValidTill:"-";
                            
                            if(ratecard.Tax.length> 0){
                                var index;
                                for(var i = 0; i< ratecard.Tax.length && i < 10; ++i){
                                    index = i+1;
                                    var tax = ratecard.Tax[i];
                                    obj["Tax" + index] = tax.TaxRate +"-"+ tax.Included?"Include":"Excluded";
                                }
                            }
                            if(ratecard.Covered.length> 0){
                                var index;
                                for(var i = 0; i< ratecard.Covered.length && i < 10; ++i){
                                    index = i+1;
                                    var covered = ratecard.Covered[i];
                                    obj["Covered" + index] =covered.mediaHouse +"-"+ covered.EditionArea;
                                }
                            }
                            if(ratecard.Remarks.length> 0){
                                var index;
                                for(var i = 0; i< ratecard.Remarks.length && i < 10; ++i){
                                    index = i+1;
                                    var remark = ratecard.Remarks[i];
                                    obj["Remark" + index] = remark.remark?remark.remark:"-";
                                }
                            }
                            
                            return obj;
                        })
                    }
                    catch (err) {
                        console.log(err)
                    }
                    
                    createSheet(el, request, response, 'MediahouseNoteExportData', 'excelReport');
                }
            })
            
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