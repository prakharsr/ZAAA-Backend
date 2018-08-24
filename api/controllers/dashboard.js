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
        if(request.body.insertionPeriod){
            var to = new Date()
            var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.insertionPeriod);
        }
        
        resolve(query);
        
    })
    
    
}

module.exports.ROchartData = async function(request, response){
    var user = response.locals.user;
    var query = await formQuery( user, request, response);
    ReleaseOrder.aggregate([
        {$unwind:"$insertions"}, 
        {$match:query},
        { $group : { 
            _id : { day: { $dayOfMonth : "$generatedAt" },month: { $month: "$generatedAt" }, year: { $year: "$generatedAt" } },
            count: {$sum: 1},
            totalAmount:{$sum:"$insertions.netAmount"},
            generated:{$sum:{
                "$cond": [{"$eq":["$insertions.marked",true]},
                "$insertions.netAmount",0]
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
};

module.exports.InvoiceData = async function(request, response){
	var user = response.locals.user;
    var query = await formQuery( user, request, response);   
    query['generated']=true;    
    ReleaseOrder.aggregate([
        {$unwind:"$insertions"}, 
        {$match:query},
        { $group : { 
            _id : null,
            count: {$sum: 1},
            totalAmount:{$sum:"$insertions.netAmount"},
            generated:{$sum:{
                "$cond": [{"$eq":["$insertions.marked",true]},
                "$insertions.netAmount",0]
            }
        }
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
};


module.exports.DueOverdueData = async function(request, response){
	var user = response.locals.user;
    var query = await formQuery( user, request, response);
    var date = new Date();
    var last = new Date(date.getTime() + (request.body.duePeriod * 24 * 60 * 60 * 1000));       
    Invoice.aggregate([
        {$match:query},
        { $group : {
            _id:null, 
            count: {$sum: 1},
            OverDueAmount:{$sum:{
                "$cond": [{"$gte":["$paymentDate", last]},
                "$pendingAmount",0]
            }},
            DueAmount:{$sum:{
                "$cond": [{"$lt":["$paymentDate", last]},
                "$pendingAmount",0]
            }},
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
                var date = new Date();
                var last = new Date(date.getTime() + (request.body.duePeriod * 24 * 60 * 60 * 1000));
                response.send({
                    success:true,
                    receipt:receipt,
                    last:last
                });
            })
            
        }
    });
};

module.exports.ClientPaymentsData = async function(request, response){
	var user = response.locals.user;
    var query = await formQuery(user, request);
    
    
    Invoice.aggregate([ 
        {$match:query},
        { $group : { 
            _id: null,
            count: {$sum: 1},
            
            shadow :{$sum:{ $add: [ "$collectedAmount", "$shadowAmount" ] }},
            collected :{$sum: "$collectedAmount" },
            completed:{$sum: "$clearedAmount" },
            pending:{$sum:"$pendingAmount"},
            received:{$sum:{ $add:["$collectedAmount", "$shadowAmount", "$clearedAmount"]}}
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

module.exports.MediahouseInvoiceData = async function(request, response){
	var user = response.locals.user;
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

module.exports.PaidUnpaidData = async function(request, response){
	var user = response.locals.user;
    var query = await formQuery(user, request);
    
    
    MediaHouseInvoice.aggregate([ 
        {$match:query},
        {$unwind:"$insertions"},
        { $group : { 
            _id: null,
            count: {$sum: 1},
            
            UnpaidAmount :{$sum:{
                "$cond": [{"$eq":["$insertions.paymentMode",'Credit']},
                "$insertions.Amount",0]
            }},
            PaidAmount :{$sum:{
                "$cond": [{"$or":[{"$eq":["$insertions.paymentMode",'Cash']},{"$eq":["$insertions.paymentMode",'Cheque']}, {"$eq":["$insertions.paymentMode",'NEFT']}]},
                "$insertions.Amount",0]
            }}            
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


module.exports.RecieptsChequeData = async function(request, response){
    var user = response.locals.user;
    var query = await formQuery(user, request);
    
    var date = new Date();
    var last = new Date(date.getTime() + (request.body.duePeriod * 24 * 60 * 60 * 1000));  
    
    
    Receipt.aggregate([ 
        {$match:query},
        { $group : { 
            _id: null,
            count: {$sum: 1},
            
            DueChequesAmount:{$sum:{
                "$cond": [{$and: [ {  $eq: ["$paymentType","Cheque" ] }, {$or:[{$eq: ["$status","3" ] },{$eq: ["$status","3" ] },{  $lte: ["$paymentDate",last ]}]}  ]},
                "$paymentAmount",0]
            }},
            DueChequesNumber:{$sum:{
                "$cond": [{$and: [ {  $eq: ["$paymentType","Cheque" ] }, {  $lte: ["$paymentDate",last ]}  ]},
                1,0]
            }},
            CreditAmount:{$sum:{
                "$cond": [{$and: [ {  $eq: ["$paymentType","Credit" ] }, {  $lte: ["$paymentDate",last ]}  ]},
                "$paymentAmount",0]
            }},
            OverDueChequesNumber:{$sum:{
                "$cond": [{$and: [ {  $eq: ["$paymentType","Cheque" ] }, {  $gt: ["$paymentDate",last ]}  ]},
                1,0]
            }},
            OverDueChequesAmount:{$sum:{
                "$cond": [{$and: [ {  $eq: ["$paymentType","Cheque" ] }, {  $gt: ["$paymentDate",last ]}  ]},
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

module.exports.RecieptsChequeDetailsData = async function(request, response){
    var user = response.locals.user;
    var query = await formQuery(user, request);
    query["paymentType"]="Cheque";
    query["status"] = {$in:["0","3"]}
    console.log(query)
    
    var date = new Date();
    var last = new Date(date.getTime() + (request.body.duePeriod * 24 * 60 * 60 * 1000));  
    Receipt.find(query, {
        _id:1,
        paymentDate: 1,
        paymentAmount: 1,
        paymentNo: 1,
        paymentBankName: 1
    }).exec(function(err, receipts){
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
module.exports.MHIChequeDetailsData = async function(request, response){
    var user = response.locals.user;
    var query = await formQuery(user, request);
    query["insertions.paymentType"]="Cheque"
    console.log(query)
    
    var date = new Date();
    var last = new Date(date.getTime() + (request.body.duePeriod * 24 * 60 * 60 * 1000));  
    
    
    MediaHouseInvoice.aggregate([
        {$unwind:"$insertions"}, 
        {$match:{
            'firm': user.firm,
            "insertions.paymentMode":"Cheque"
        }},
        { $group : { 
            _id: {
                "ChequeDate":"$insertions.paymentDate",
                "ChequeAmount":"$insertions.paymentAmount",
                "ChequeNo":"$insertions.paymentNo",
                "ChequeBank":"$insertions.paymentBankName"}
        },

        }
    ])
    .exec(function(err, mhis){
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
                mhis: mhis
            });
            
        }
    });
}


module.exports.MediaHouseInvoiceChequeData = async function(request, response){
    var user = response.locals.user;
    var query = await formQuery(user, request);
    
    var date = new Date();
    var last = new Date(date.getTime() + (request.body.duePeriod * 24 * 60 * 60 * 1000));  
    
    
    MediaHouseInvoice.aggregate([ 
        {$match:query},
        { $group : { 
            _id: null,
            count: {$sum: 1},
            
            DueChequesAmount:{$sum:{
                "$cond": [{$and: [ {  $eq: ["$insertions.paymentType","Cheque" ] }, {  $lte: ["$insertions.paymentDate",last ]}  ]},
                "$insertions.paymentAmount",0]
            }},
            DueChequesNumber:{$sum:{
                "$cond": [{$and: [ {  $eq: ["$insertions.paymentType","Cheque" ] }, {  $lte: ["$insertions.paymentDate",last ]}  ]},
                1,0]
            }},
            CreditAmount:{$sum:{
                "$cond": [{$and: [ {  $eq: ["$insertions.paymentType","Credit" ] }, {  $lte: ["$insertions.paymentDate",last ]}  ]},
                "$insertions.paymentAmount",0]
            }},
            OverDueChequesNumber:{$sum:{
                "$cond": [{$and: [ {  $eq: ["$insertions.paymentType","Cheque" ] }, {  $gt: ["$insertions.paymentDate",last ]}  ]},
                1,0]
            }},
            OverDueChequesAmount:{$sum:{
                "$cond": [{$and: [ {  $eq: ["$insertions.paymentType","Cheque" ] }, {  $gt: ["$insertions.paymentDate",last ]}  ]},
                "$insertions.paymentAmount",0]
            }},
            
            
        } }
    ])
    .exec(function(err,mhinvoices){
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
                mhinvoices:mhinvoices
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