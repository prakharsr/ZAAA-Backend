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
                                "Mediahouse Name": releaseOrder.publicationName ? releaseOrder.publicationName : "-",
                                "Edition": releaseOrder.publicationEdition ? releaseOrder.publicationEdition : "-",
                                "Media Type": releaseOrder.mediaType ? releaseOrder.mediaType : "-",
                                "Mediahouse State": releaseOrder.publicationState ? releaseOrder.publicationState : "-",
                                "Mediahouse GSTIN": releaseOrder.publicationGSTIN.GSTType +"-"+ releaseOrder.publicationGSTIN.GSTNo,
                                "Client Name": releaseOrder.clientName?releaseOrder.clientName:"-",
                                "Client State": releaseOrder.clientState?releaseOrder.clientState:"-",
                                "Client GSTIN": releaseOrder.clientGSTIN.GSTType + "-" +releaseOrder.clientGSTIN.GSTNo,
                                "Ad Type": releaseOrder.adType?releaseOrder.adType:"-",
                                "Rate": releaseOrder.rate?releaseOrder.rate:"-",
                                "unit": releaseOrder.unit?releaseOrder.unit:"-",
                                "Category1":releaseOrder.adCategory1?releaseOrder.adCategory1:"-",
                                "Category2":releaseOrder.adCategory2?releaseOrder.adCategory2:"-",
                                "Category3":releaseOrder.adCategory3?releaseOrder.adCategory3:"-",
                                "Category4":releaseOrder.adCategory4?releaseOrder.adCategory4:"-",
                                "Category5":releaseOrder.adCategory5?releaseOrder.adCategory5:"-",
                                "Category6":releaseOrder.adCategory6?releaseOrder.adCategory6:"-",
                                "Hue":releaseOrder.adHue?releaseOrder.adHue:"-",
                                "Words":releaseOrder.AdWords?releaseOrder.AdWords:"-",
                                "Size":releaseOrder.adSizeL + "x"+ releaseOrder.adSizeW,
                                "Time":releaseOrder.adTime?releaseOrder.adTime:"-",
                                "Position":releaseOrder.adPosotion?releaseOrder.adPosotion:"-",
                                "Scheme-Paid":releaseOrder.adSchemePaid?releaseOrder.adSchemePaid:"-",
                                "Scheme-Free":releaseOrder.adSchemeFree?releaseOrder.adSchemeFree:"-",
                                "Remark": releaseOrder.Remark,
                                "Amount": releaseOrder.adGrossAmount?releaseOrder.adGrossAmount:"-",     
                                "Payment Type":releaseOrder.paymentType,
                                "Payment Date":releaseOrder.paymentDate,
                                "Payment No":releaseOrder.paymentNo,
                                "Payment Amount":releaseOrder.paymentAmount,
                                "Payment BankName": releaseOrder.paymentBankName
                                
                                
                            }
                            if(releaseOrder.PremiumBox.Included){
                                
                            }
                            if(releaseOrder.insertions.length> 0){
                                var index;
                                for(var i = 0; i< releaseOrder.insertions.length && i < 10; ++i){
                                    index = i+1;
                                    insertion = releaseOrder.insertions[i];
                                    obj["Insertion" + index] = insertion.ISODate;
                                }
                                obj["Publication Discount"] = releaseOrder.publicationDiscount;
                                obj["Agency Discount 1"] = releaseOrder.agencyDiscount1;
                                obj["Agency Discount 2"] = releaseOrder.agencyDiscount2;
                                obj["Tax"] = releaseOrder.taxAmount.primary + releaseOrder.taxAmount.secondary;
                                obj["Tax included"]  =releaseOrder.taxIncluded;
                                
                                
                            }
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
                                "Date": invoice.date ? invoice.date : "-",
                                "Mediahouse Name": invoice.publicationName ? invoice.publicationName : "-",
                                "Edition": invoice.publicationEdition ? invoice.publicationEdition : "-",
                                "Media Type": invoice.mediaType ? invoice.mediaType : "-",
                                "Mediahouse State": invoice.publicationState ? invoice.publicationState : "-",
                                "Mediahouse GSTIN": invoice.publicationGSTIN.GSTType +"-"+ invoice.publicationGSTIN.GSTNo,
                                "Client Name": invoice.clientName?invoice.clientName:"-",
                                "Client State": invoice.clientState?invoice.clientState:"-",
                                "Client GSTIN": invoice.clientGSTIN.GSTType + "-" +invoice.clientGSTIN.GSTNo,
                                "Executive Name": invoice.executiveName?invoice.executiveName:"-",
                                "Executive Organization":invoice.executiveOrg?invoice.executiveOrg:"-",
                                
                                
                                "Gross Amount":invoice.adGrossAmount?invoice.adGrossAmount:"-",
                                "Publication Discount":invoice.publicationDiscount?invoice.publicationDiscount:"-",
                                "Agency Discount1":invoice.agencyDiscount1?invoice.agencyDiscount1:"-",
                                "Agency Discount2":invoice.agencyDiscount2?invoice.agencyDiscount2:"-",
                                "Extra Charges":invoice.extraCharges?invoice.extraCharges:"-",
                                "Tax Amount":invoice.taxAmount?invoice.taxAmount:"-",
                                "Tax Included":invoice.taxIncluded?invoice.taxIncluded:"-",
                                "Net Amount":invoice.netAmountFigures?invoice.netAmountFigures:"-",
                                "Pending Amount":invoice.pendingAmount,
                                "Final Tax Amount":invoice.FinalTaxAmount,
                                
                            }
                            if(invoice.otherCharges.length> 0){
                                var index;
                                var index = +i + 1
                                var otherCharge = invoice.otherCharges[i];
                                for(var i = 0; i< otherCharge.length && i < 8; ++i){
                                    index = i+1;
                                    obj["Type" + index] = otherCharge.chargeType;
                                    obj["Amount" + index] = otherCharge.amount;
                                } 
                            }
                            if(invoice.insertions.length> 0){
                                var index;
                                for(var i = 0; i< invoice.insertions.length && i < 8; ++i){
                                    
                                    index = +i + 1
                                    var insertion = invoice.insertions[i];
                                    obj["Insertion" + index] = insertion.date.day + "/"+insertion.date.month+"/"+insertion.date.year;
                                } 
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
            
            Receipt.find(query, function (err, receipts) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    try{
                        var el =receipts.map(function (receipt) {
                            var obj =  {
                                "Receipt Number": receipt.receiptNO? receipt.receiptNO : "-",
                                "Date": receipt.date ? receipt.date : "-",
                                "Mediahouse Name": receipt.publicationName ? receipt.publicationName : "-",
                                "Edition": receipt.publicationEdition ? receipt.publicationEdition : "-",
                                "Media Type": receipt.mediaType ? receipt.mediaType : "-",
                                "Mediahouse State": receipt.publicationState ? receipt.publicationState : "-",
                                "Mediahouse GSTIN": receipt.publicationGSTIN.GSTType +"-"+ receipt.publicationGSTIN.GSTNo,
                                "Client Name": receipt.clientName?receipt.clientName:"-",
                                "Client State": receipt.clientState?receipt.clientState:"-",
                                "Client GSTIN": receipt.clientGSTIN.GSTType + "-" +receipt.clientGSTIN.GSTNo,
                                "Executive Name": receipt.executiveName?receipt.executiveName:"-",
                                "Executive Organization":receipt.executiveOrg?receipt.executiveOrg:"-",
                                
                                
                                "Gross Amount":receipt.adGrossAmount?receipt.adGrossAmount:"-",
                                "Publication Discount":receipt.publicationDiscount?receipt.publicationDiscount:"-",
                                "Agency Discount1":receipt.agencyDiscount1?receipt.agencyDiscount1:"-",
                                "Agency Discount2":receipt.agencyDiscount2?receipt.agencyDiscount2:"-",
                                "Extra Charges":receipt.extraCharges?receipt.extraCharges:"-",
                                "Tax Amount":receipt.taxAmount?receipt.taxAmount:"-",
                                "Tax Included":receipt.taxIncluded?receipt.taxIncluded:"-",
                                "Net Amount":receipt.netAmountFigures?receipt.netAmountFigures:"-",
                                "Pending Amount":receipt.pendingAmount,
                                "Final Tax Amount":receipt.FinalTaxAmount,
                                
                                "Payment Type":receipt.paymentType,
                                "Payment Date":receipt.paymentDate,
                                "Payment No":receipt.paymentNo,
                                "Payment Amount":receipt.paymentAmount,
                                "Payment BankName": receipt.paymentBankName
                            }
                            if(receipt.otherCharges.length> 0){
                                var index;
                                for(var i = 0; i< receiptotherCharge.length && i < 8; ++i){
                                    index = i+1;
                                    var otherCharge = receipt.otherCharges[i];
                                    obj["Type" + index] = otherCharge.chargeType;
                                    obj["Amount" + index] = otherCharge.amount;
                                } 
                            }
                            return obj
                        })
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
            
            MediaHouseInvoice.find(query, function (err, mhinvoices) {
                if (err) {
                    console.log(err + "");
                    response.send({
                        success: false,
                        msg: err + ""
                    });
                }
                else {
                    var el = mhinvoices.map(function(mhinvoice){
                        try{
                            
                            var obj = {
                                "Mediahouse Name":mhinvoice.publicationName,
                                "Edition":mhinvoice.publicationEdition,
                                "Media Type":mhiinvoice.mediaType,
                                "Mediahouse State":publicationState,
                                "GSTIN":publicationGSTIN.GSTType +"-"+publicationGSTIN.GSTNo,
                            }; 
                            var index;
                            if(mhinvoice.insertions.length> 0){
                                
                                for(var i = 0; i< mhinvoice.insertions.length && i < 20; ++i){
                                    index = i+1;
                                    insertion = mhinvoice.insertions[i];
                                    obj["Insertion - " + index] = insertion.insertionDate;
                                }
                            }
                            
                            obj["Creation Date"]=mhinvoice.date;
                            obj["RO Number"]=mhinvoice.releaseOrderNo;
                            obj["Invoice Number"]=mhinvoice.MHINo;
                            obj["Dated"]=mhinvoice.MHIDate;
                            obj["Amount"]=mhinvoice.MHIGrossAmount;
                            obj["Tax Amount"]=mhinvoice.MHITaxAmount;
                            return obj;
                        }
                        catch(err){
                            console.log(err);
                        }
                    })
                    createSheet(el, request, response, 'MediahouseInvoiceExportData', 'excelReport');
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
                                "Mediahouse Name": ratecard.BokingCenter.MediaHouseName ?ratecard.BokingCenter.MediaHouseName : "-",
                                "Edition": ratecard.BokingCenter.Edition?ratecard.BokingCenter.Edition:"-",
                                "Pullout Name":ratecard.BokingCenter.PulloutName?ratecard.BokingCenter.PulloutName:"-",
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
                                "Rate":releaseOrder.Rate.rateQuantity + "-" + releaseOrder.Rate.unit+"-"+ releaseOrder.Rate.unitQuantity,
                                "Position":ratecard.Posotion?ratecard.Posotion:"-",
                                "Maximum Size":ratecard.MaxSizeLimit?ratecard.MaxSizeLimit.Length +" x "+ratecard.MaxSizeLimit.Width:"-",
                                "Minimum Size":ratecard.MinSizeLimit?ratecard.MinSizeLimit.Length +" x "+ratecard.MinSizeLimit.Width:"-",
                               
                            }
                            if(ratecard.FixSize.length> 0){
                                var index;
                                for(var i = 0; i< ratecard.FixSize.length && i < 10; ++i){
                                    index = i+1;
                                    fixsize = ratecard.FixSize[i];
                                    obj["FixSize" + index] = fixsize.Length + " x "+fixsize.Width + " - "+fixsize.Amount;
                                }
                            }
                                if(ratecard.Scheme.length> 0){
                                    var index;
                                    for(var i = 0; i< ratecard.Scheme.length && i < 10; ++i){
                                        index = i+1;
                                        scheme = ratecard.Scheme[i];
                                        obj["Scheme" + index] = scheme.paid + "-Paid "+scheme.free + "-Free "+fixsize.Amount+"-Time limit";
                                    }
                                }
                            
                                obj["PremiumCustom"]=ratecard.PremiumCustom?ratecard.PremiumCustom.PremiumType+"-"+ratecard.PremiumCustom.Amount+"-"+(ratecard.PremiumCustom.Percentage?"%":"Rs."):"-";
                                obj["PremiumBox"]=ratecard.PremiumBox?ratecard.PremiumBox:"-";
                                obj["PremiumBaseColour"]=ratecard.Premium.PremiumBaseColour?ratecard.PremiumBaseColour:"-";
                                obj["PremiumCheckMark"]=ratecard.PremiumCheckMark?ratecard.PremiumCheckMark:"-";
                                obj["PremiumEmail"]=ratecard.PremiumEmailId?ratecard.PremiumEmailId:"-";
                                obj["PremiumWebsite"]=ratecard.PremiumWebsite?ratecard.PremiumWebsite:"-";
                                obj["PremiumExtraWords"]=ratecard.PremiumExtraWords?ratecard.PremiumExtraWords:"-";
                                obj["Validity"]=ratecard.ValidFrom?"From "+ratecard.ValidFrom+"-"+"Upto "+ratecard.ValidTill:"-";

                                if(ratecard.Tax.length> 0){
                                    var index;
                                    for(var i = 0; i< ratecard.Tax.length && i < 10; ++i){
                                        index = i+1;
                                        tax = ratecard.Tax[i];
                                        obj["Tax" + index] = tax.TaxRate +"-"+ tax.Included?"Include":"Excluded";
                                    }
                                }
                                if(ratecard.Covered.length> 0){
                                    var index;
                                    for(var i = 0; i< ratecard.Covered.length && i < 10; ++i){
                                        index = i+1;
                                        covered = ratecard.Covered[i];
                                        obj["Covered" + index] =covered.mediahouse +"-"+ covered.EditionArea;
                                    }
                                }
                                if(ratecard.Remarks.length> 0){
                                    var index;
                                    for(var i = 0; i< ratecard.Remarks.length && i < 10; ++i){
                                        index = i+1;
                                        remark = ratecard.Remarks[i];
                                        obj["Remark" + index] = remark.remark?remark.remark:"-";
                                    }
                                }
                            
                        })
                        return obj;
                        
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