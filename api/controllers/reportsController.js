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
                                "Edition": mediahouse.Address.edition,
                                "City": mediahouse.Address.city,
                                "State": mediahouse.Address.state,
                                "Phone": mediahouse.OfficeLandline.std + '-' + mediahouse.OfficeLandline.phone,
                                "GSTIN": mediahouse.GSTIN.GSTType + '-' + (mediahouse.GSTIN.GSTNo ? mediahouse.GSTIN.GSTNo : "-"),
                                "Remark": mediahouse.Remark
                            }

                            for (var i = 0; i < mediahouse.pullouts.length && i < 2; ++i) {
                                var index = +i + 1
                                var pullout = mediahouse.pullouts[i];
                                obj["Pullout" + index] = pullout.Name;
                                obj["PulloutLanguage" + index] = pullout.Language;
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
                            return {
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
                                "Company Name": executive.CompanyName ? executive.CompanyName : "-",
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

            ReleaseOrder.find(query, function (err, releaseOrders) {
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
                            return {
                                "Executive Name": releaseOrder.ExecutiveName ? releaseOrder.ExecutiveName : "-",
                                "Company Name": releaseOrder.CompanyName ? releaseOrder.CompanyName : "-",
                                "Designation": releaseOrder.Designation ? releaseOrder.Designation : "-",
                                "Departmet": releaseOrder.Department ? releaseOrder.Department : "-",
                                "MobileNo": releaseOrder.MobileNo,
                                "Email": releaseOrder.EmailId,
                                "DOB": releaseOrder.DateOfBirth,
                                "Anniversary": releaseOrder.Anniversary,
                                "Remark": releaseOrder.Remark,

                            }
                        })
                    }
                    catch (err) {
                        console.log(err)
                    }

                    createSheet(releaseOrders, request, response, 'ReleaseOrderExportData', 'excelReport');
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
                    createSheet(invoices, request, response, 'ClientInvoiceExportData', 'excelReport');
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
                    createSheet(receipts, request, response, 'ReceiptExportData', 'excelReport');
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
                    createSheet(mhinvoices, request, response, 'MediahouseInvoiceExportData', 'excelReport');
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
                    createSheet(mhnotes, request, response, 'MediahouseNoteExportData', 'excelReport');
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
                    createSheet(clnotes, request, response, 'ClientNoteExportData', 'excelReport');
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
                    createSheet(ratecards, request, response, 'MediahouseNoteExportData', 'excelReport');
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