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
var perPage=20;


module.exports.mediahouseReports = function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            var query = {"firm":user.firm}
            if(request.body.creationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['createdAt']={$gte: from, $lte:to} 
            }
            if(request.body.updationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['updatedAt']={$gte: from, $lte:to} 
            }
        
            MediaHouse.find({query}, function(err, mediahouses){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(mediahouses, request, response,'MediaHouseExportData', 'excelReport');
                }
            })
        
            }
     });

};

module.exports.clientsReports = function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            var query = {"firm":user.firm}
            if(request.body.creationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['createdAt']={$gte: from, $lte:to} 
            }
            if(request.body.updationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['updatedAt']={$gte: from, $lte:to} 
            }
        
            Client.find({query}, function(err, clients){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(clients, request, response,'ClientsExportData', 'excelReport');
                }
            })
        
            }
     });

};

module.exports.ExecutiveReports = function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            var query = {"firm":user.firm}
            if(request.body.creationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['createdAt']={$gte: from, $lte:to} 
            }
            if(request.body.updationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['updatedAt']={$gte: from, $lte:to} 
            }
        
            Executive.find({query}, function(err, excecutives){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(executives, request, response,'ExecutiveExportData', 'excelReport');
                }
            })
        
            }
     });

};

module.exports.ReleaseOrderReports = function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            var query = {"firm":user.firm}
            if(request.body.creationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['createdAt']={$gte: from, $lte:to} 
            }
            if(request.body.updationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['updatedAt']={$gte: from, $lte:to} 
            }
        
            ReleaseOrder.find({query}, function(err, releaseOrders){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(releaseOrders, request, response,'ReleaseOrderExportData', 'excelReport');
                }
            })
        
            }
     });

};

module.exports.ClientInvoiceReports = function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            var query = {"firm":user.firm}
            if(request.body.creationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['createdAt']={$gte: from, $lte:to} 
            }
            if(request.body.updationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['updatedAt']={$gte: from, $lte:to} 
            }
        
            Invoice.find({query}, function(err, invoices){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(invoices, request, response,'ClientInvoiceExportData', 'excelReport');
                }
            })
        
            }
     });

};

module.exports.ReceiptReports = function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            var query = {"firm":user.firm}
            if(request.body.creationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['createdAt']={$gte: from, $lte:to} 
            }
            if(request.body.updationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['updatedAt']={$gte: from, $lte:to} 
            }
        
            Receipt.find({query}, function(err, receipts){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(receipts, request, response,'ReceiptExportData', 'excelReport');
                }
            })
        
            }
     });

};

module.exports.MediaHouseInvoiceReports = function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            var query = {"firm":user.firm}
            if(request.body.creationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['createdAt']={$gte: from, $lte:to} 
            }
            if(request.body.updationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['updatedAt']={$gte: from, $lte:to} 
            }
        
            MediaHouseInvoice.find({query}, function(err, mhinvoices){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(mhinvoices, request, response,'MediahouseInvoiceExportData', 'excelReport');
                }
            })
        
            }
     });

};

module.exports.MediaHouseNotesReports = function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            var query = {"firm":user.firm}
            if(request.body.creationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['createdAt']={$gte: from, $lte:to} 
            }
            if(request.body.updationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['updatedAt']={$gte: from, $lte:to} 
            }
        
            MediaHouseNotes.find({query}, function(err, mhnotes){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(mhnotes, request, response,'MediahouseNoteExportData', 'excelReport');
                }
            })
        
            }
     });

};
module.exports.ClientNotesReports = function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            var query = {"firm":user.firm}
            if(request.body.creationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['createdAt']={$gte: from, $lte:to} 
            }
            if(request.body.updationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['updatedAt']={$gte: from, $lte:to} 
            }
        
            ClientNotes.find({query}, function(err, clnotes){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(clnotes, request, response,'ClientNoteExportData', 'excelReport');
                }
            })
        
            }
     });

};

module.exports.RateCardReports = function(request,response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
            var query = {"firm":user.firm}
            if(request.body.creationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['createdAt']={$gte: from, $lte:to} 
            }
            if(request.body.updationPeriod != 0)
            {
                    var to = new Date()
                    var from = new Date( to.getTime()- request.body.creationPeriod *24*60*60*1000);
                    query['updatedAt']={$gte: from, $lte:to} 
            }
        
            RateCard.find({query}, function(err, ratecards){
                if(err){
                    console.log(err+ "");
                    response.send({
                        success:false,
                        msg: err +""
                    });
                }
                else{
                    createSheet(ratecards, request, response,'MediahouseNoteExportData', 'excelReport');
                }
            })
        
            }
     });

};







async function createSheet(data, request, response, title, subject){
    console.log(data)
    var wb = XLSX.utils.book_new();
    
    wb.Props = {
        Title: title,
        Subject: subject,
        Author: "AAMAN",
        CreatedDate: new Date(2017,12,19)
    };
    
    var ws = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(wb, ws, "MONTHLY SHEET");

    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'base64'});

    response.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename='+title+".xlsx"
    });

    var decoder = base64.decode();
    var xlStream = new stream.PassThrough();
    xlStream.pipe(decoder)
      .pipe(response);

    xlStream.write(wbout);

    response.end();
}