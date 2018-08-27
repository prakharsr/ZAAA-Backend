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

function getFinancialYear(date){
    var month = date.getMonth();
    var year = date.getFullYear();
    var period={};
    if(month<=2)
    {
     var from = new  Date(year-1,03,01);//from 1 april of last year
     var upto = new Date(year,02,31);// to 31 march of this year
     period['from'] = from;
     period['upto']=upto;   
    }
    else if (month>2)
    {
     var from = new  Date(year,03,01);//from 1 april of this year
     var upto = new  Date(year+1,02,31);// to 31 march of next year
     period['from'] = from;
     period['upto']=upto;   
    }
    console.log(period);
    return period;
}
function getQuarter(d){
    m = d.getMonth();
    var q = Math.floor(m/3)?Math.floor(m/3):4;
  return q;
}
function getFinancialQuarter(date){
    var month = date.getMonth();
    var year = date.getFullYear();
    var period={};
    var quarter= getQuarter(date);
    switch(quarter){
        case 1:{
            console.log(quarter)
            var from= new Date(year,03,01);
            var upto = new Date(year,05,30);
            period['from']=from;
            period['upto']=upto;
            break;
        }
        case 2:{
            console.log(quarter)
            var from= new Date(year,06,01);
            var upto = new Date(year,08,30);
            period['from']=from;
            period['upto']=upto;
            break;

        }
        case 3:{
            console.log(quarter)
            var from= new Date(year,09,01);
            var upto = new Date(year,11,31);
            period['from']=from;
            period['upto']=upto;
            break;

        }
        case 4:{
            console.log(quarter)
            var from= new Date(year,00,01);
            var upto = new Date(year,02,31);
            period['from']=from;
            period['upto']=upto;
            break;
        }
    }
    console.log(period);
    return period;
}
function getFinancialMonth(date){
    date = date || new Date()
    var month = date.getMonth();
    var year = date.getFullYear();
    var from = new Date(year, month, 1);
    var upto = new Date(year, month + 1, 0);
    var period={
        from:from,
        upto:upto
    }
    console.log(period);
    return period;
}
function uptoTodayPeriod(date){
    var date = new Date();
    var period = {
        from: new Date(new Date().setMonth(date.getMonth()-3)),
        upto: date,
    }
    console.log(period);
    return period;
}

function next7dayPeriod(date){
    var date = new Date();
    var period = {
        from: new Date(new Date().setMonth(date.getMonth()-3)),
        upto: new Date(new Date().setDate(date.getDate()+7))
    }
    console.log(period);
    return period;
}
function next15dayPeriod(date){
    var date = new Date();
    var period = {
        from: new Date(new Date().setMonth(date.getMonth()-3)),
        upto: new Date(new Date().setDate(date.getDate()+15))
    }
    console.log(period);
    return period;
}
function compareFinancialyear(date){
    var curr = new Date(date);
    var last = new Date(curr.getFullYear()-1, curr.getMonth(), curr.getDay());
    var period={
        period1: getFinancialYear(curr),
        period2: getFinancialYear(last)
    };
    console.log(period);
    return period;
}
function compareFinancialQuarter(date){
    var curr = new Date(date);
    var last = new Date(curr.getFullYear()-1, curr.getMonth(), curr.getDay());
    var period={
        period1: getFinancialQuarter(curr),
        period2: getFinancialQuarter(last)
    };
    console.log(period);
    return period;
}
function compareFinancialMonth(){
    var curr = new Date();
    var last = new Date(curr.getFullYear()-1, curr.getMonth(), curr.getDay());
    var period={
        period1: getFinancialMonth(curr),
        period2: getFinancialMonth(last)
    };
    console.log(period);
    return period;
}




module.exports.ROchartData = async function(request, response){
    var user = response.locals.user;
    var query = {'firm':user.firm};
    var period;
    if(request.body.filter){
        switch(request.body.filter){
            case 1:{
            period = compareFinancialyear(new Date())
            break;}
            case 2:{
            period = compareFinancialQuarter(new Date(new Date().getFullYear(),04,01))
            break;}
            case 3:{
            period = compareFinancialQuarter(new Date(new Date().getFullYear(),07,01))
            break;}
            case 4:{
            period = compareFinancialQuarter(new Date(new Date().getFullYear(),10,01))
            break;}
            case 5:{
            if(new Date().getMonth<=2)
            period = compareFinancialQuarter(new Date(new Date().getFullYear(),01,01));
            else
            period = compareFinancialQuarter(new Date(new Date().getFullYear()+1,01,01));
            break;}
        }
    }
    ReleaseOrder.aggregate([
        {$unwind:"$insertions"}, 
        {$match:query},
        { $group : { 
            _id : { day: { $dayOfMonth : "$generatedAt" },month: { $month: "$generatedAt" }, year: { $year: "$generatedAt" } },
            count: {$sum: 1},
            // totalAmount:{$sum:"$insertions.netAmount"},
            // generated:{$sum:{
            //     "$cond": [{"$eq":["$insertions.marked",true]},
            //     "$insertions.netAmount",0]
            // },
            totalAmount:{$sum:{
                "$cond": [{"$and":[{"$eq":["$insertions.marked",true]},{"$gte":["$generatedAt", period.period1.from]},{"$lt":["$generatedAt", period.period1.upto]}]},
                {"$add":["$insertions.netAmount", "$insertions.taxAmount"]},0]
            }},
            generated:{$sum:{
                "$cond": [{"$and":[{"$eq":["$insertions.marked",true]},{"$gte":["$generatedAt", period.period2.from]},{"$gte":["$generatedAt", period.period2.upto]}]},
                {"$add":["$insertions.netAmount", "$insertions.taxAmount"]},0]
            }},
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
    var query = {'firm':user.firm};;   
    query['generated']=true;
    if(request.body.filter){
        switch(request.body.filter){
            case 2:{
            period = getFinancialYear(new Date())
            query['generatedAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 3:{
            period = getFinancialQuarter(new Date())
            query['generatedAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 4:{
            period = getFinancialMonth(new Date())
            query['generatedAt']={"$gte":period.from,"$lt":period.upto }
            break;}
        }
    }
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
    var query = {'firm':user.firm};
    if(request.body.filter){
        switch(request.body.filter){
            case 2:{
            period = getFinancialYear(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 3:{
            period = getFinancialQuarter(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 4:{
            period = getFinancialMonth(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
        }
    }       
    Invoice.aggregate([
        {$match:query},
        { $group : {
            _id:null, 
            count: {$sum: 1},
            OverDueAmount:{$sum:{
                "$cond": [{"$gte":["$paymentDate",new Date()]},
                "$pendingAmount",0]
            }},
            DueAmount:{$sum:{
                "$cond": [{"$lt":["$paymentDate", new Date()]},
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
                response.send({
                    success:true,
                    receipt:receipt,
                });
            })
            
        }
    });
};

module.exports.ClientPaymentsData = async function(request, response){
	var user = response.locals.user;
    var query = {'firm':user.firm};
    if(request.body.filter){
        switch(request.body.filter){
            case 2:{
            period = getFinancialYear(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 3:{
            period = getFinancialQuarter(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 4:{
            period = getFinancialMonth(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
        }
    }
    Invoice.aggregate([ 
        {$match:query},
        { $group : { 
            _id: null,
            count: {$sum: 1},
            
            shadow :{$sum: "$shadowAmount"},
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
    var query = {'firm':user.firm};
    if(request.body.filter){
        switch(request.body.filter){
            case 2:{
            period = getFinancialYear(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 3:{
            period = getFinancialQuarter(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 4:{
            period = getFinancialMonth(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
        }
    } 
    
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
    var query = {'firm':user.firm};
    if(request.body.filter){
        switch(request.body.filter){
            case 2:{
            period = getFinancialYear(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 3:{
            period = getFinancialQuarter(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 4:{
            period = getFinancialMonth(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
        }
    }
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
    var query = {'firm':user.firm};
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
    var query = {'firm':user.firm};
    query["paymentType"]="Cheque";
    query["status"] = {$in:["0","3"]}
    if(request.body.filter){
        switch(request.body.filter){
            case 1:{
            period = uptoTodayPeriod(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 2:{
            period = next7dayPeriod(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 3:{
            period = next15dayPeriod(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
        }
    }
    Receipt.find(query, {
        _id:1,
        paymentDate: 1,
        paymentAmount: 1,
        paymentNo: 1,
        paymentBankName: 1
    })
    .sort({"paymentDate":-1})
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
module.exports.MHIChequeDetailsData = async function(request, response){
    var user = response.locals.user;
    var query = {'firm':user.firm};
    query["insertions.paymentType"]="Cheque"
    if(request.body.filter){
        switch(request.body.filter){
            case 1:{
            period = uptoTodayPeriod(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 2:{
            period = next7dayPeriod(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 3:{
            period = next15dayPeriod(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
        }
    }
    MediaHouseInvoice.aggregate([
        {$unwind:"$insertions"}, 
        {$match:{
            'firm': user.firm,
            "insertions.paymentMode":"Cheque"
        }},
        {$sort:{"insertions.paymentDate":1}},
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
    var query = {'firm':user.firm};
    if(request.body.filter){
        switch(request.body.filter){
            case 1:{
            period = uptoTodayPeriod(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 2:{
            period = next7dayPeriod(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
            case 3:{
            period = next15dayPeriod(new Date())
            query['createdAt']={"$gte":period.from,"$lt":period.upto }
            break;}
        }
    }
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
    uptoTodayPeriod(new Date());
    next15dayPeriod(new Date());
    next7dayPeriod(new Date());
    
    response.send({
        success:true,
        user:response.locals.user,
        firm:response.locals.firm
    })
};