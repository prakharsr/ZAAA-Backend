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


function formQuery(user, request){
    return new Promise((resolve, reject) => {
        var query = {'firm':user.firm};
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
        
        resolve(query);
        
    })
    
    
}

module.exports.ROchartData = function(request, response){
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
            var query = await formQuery( user, request, response);
            ReleaseOrder.aggregate([
                {$unwind:"$insertions"}, 
                {$match:query},
                { $group : { 
                    _id : { day: { $dayOfMonth : "$date" },month: { $month: "$date" }, year: { $year: "$date" } },
                    count: {$sum: 1},
                    totalAmount:{$sum:"$insertions.Amount"},
                    generated:{$sum:{
                        "$cond": [{"$eq":["$insertions.marked",true]},
                        "$insertions.Amount",0]
                    }
                }
            }
        }
    ])
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
                response.send({
                    success:true,
                    releaseOrders:releaseOrders
                });
            })
            
        }
    });
}	
});
};

module.exports.InvoiceData = function(request, response){
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
            var query = await formQuery( user, request, response);       
            Invoice.aggregate([
                {$match:query},
                { $group : { 
                    _id: null,
                    count: {$sum: 1},
                    totalAmount:{$sum:{$add:"$FinalTaxAmount"}},
                    generated:{$sum:"$collectedAmount"}
                    
                } 
            }
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
                response.send({
                    success:true,
                    invoices: invoices
                });
            }
        });
    }	
});
};


module.exports.DueOverdueData = function(request, response){
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
            var query = await formQuery( user, request, response);       
            Receipt.aggregate([
                {$match:query},
                { $group : {
                    _id:null, 
                    count: {$sum: 1},
                    onCreditAmount:{$sum:{
                        "$cond": [{"$eq":["$paymentType",'Credit']},
                        "$paymentAmount",0]
                    }},
                    totalAmount:{$sum:"$paymentAmount"},
                }}
            ])
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
                            receipt:receipt
                        });
                    })
                    
                }
            });
        }	
	});
};

module.exports.ClientPaymentsData = function(request, response){
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
            var query = await formQuery(user, request);
            
            
            Invoice.aggregate([ 
                {$match:query},
                { $group : { 
                    _id: null,
                    count: {$sum: 1},
                    
                    shadow :{$sum:{ $add: [ "$pendingAmount", "$collectedAmount" ] }},
                    collectedAmount :{$sum: "$collectedAmount" },
                    completed:{$sum: "$clearedAmount" },
                    totalAmount:{$sum:"$FinalTaxAmount"},
                    pendingAmount:{$sum:"$pendingAmount"}
                    
                    
                } }
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
                            invoices: invoices
                        });
                    })
                    
                }
            });
        }	
	});
}

module.exports.MediahouseInvoiceData = function(request, response){
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
            var query = await formQuery(user, request);
            
            
            MediaHouseInvoice.aggregate([ 
                {$match:query},
                {$unwind:"$insertions"},
                { $group : { 
                    _id: null,
                    count: {$sum: 1},
                    
                    collectedAmount :{$sum: "$insertions.collectedAmount" },
                    totalAmount:{$sum:"$insertions.Amount"},
                    pendingAmount:{$sum:"$insertions.pendingAmount"}
                    
                    
                } }
            ])
            .exec(function(err, mhinvoices){
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
                            mhinvoices: mhinvoices
                        });
                    })
                    
                }
            });
        }	
	});
}



module.exports.RecieptsChequeData = function(request, response){
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
            var query = await formQuery(user, request);
            
            
            Receipt.aggregate([ 
                {$match:query},
                { $group : { 
                    _id: null,
                    count: {$sum: 1},
                    
                    DueChequesAmount:{$sum:{
                        "$cond": [{$and: [ {  $eq: ["$paymentType","Cheque" ] }, {  $lte: ["$paymentDate",new Date() ]}  ]},
                        "$paymentAmount",0]
                    }},
                    DueChequesNumber:{$sum:{
                        "$cond": [{$and: [ {  $eq: ["$paymentType","Cheque" ] }, {  $lte: ["$paymentDate",new Date() ]}  ]},
                        1,0]
                    }},
                    CreditAmount:{$sum:{
                        "$cond": [{$and: [ {  $eq: ["$paymentType","Credit" ] }, {  $lte: ["$paymentDate",new Date() ]}  ]},
                        "$paymentAmount",0]
                    }},
                    OverDueChequesNumber:{$sum:{
                        "$cond": [{$and: [ {  $eq: ["$paymentType","Cheque" ] }, {  $gt: ["$paymentDate",new Date() ]}  ]},
                        1,0]
                    }},
                    OverDueChequesAmount:{$sum:{
                        "$cond": [{$and: [ {  $eq: ["$paymentType","Cheque" ] }, {  $gt: ["$paymentDate",new Date() ]}  ]},
                        "$paymentAmount",0]
                    }},
                    
                    
                } }
            ])
            .exec(function(err, receipts){
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
                        receipts: receipts
                    });
                    
                }
            });
        }	
	});
}

module.exports.check= function(request, response, user){
console.log(response.locals.user);
    response.send({
        success:true,
        user:response.locals.user,
        firm:response.locals.firm
    })
};