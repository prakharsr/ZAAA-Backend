var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);


var MediaHouseInvoiceSchema = new mongoose.Schema({
    
    releaseOrderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ReleaseOrder"
    },
    insertions:[
        {
            date:{day:String,month:String,year:String},
            marked:{type:Boolean, default: false},
            state:{type:Number, default: 0},
            Amount:{
                type:Number,
            },
            ISODate: Date, 
            MHID:{type:mongoose.Schema.Types.ObjectId, ref:"MediaHouseInvoice"}
        }
        ],
    date: {
        type: Date,
        default: new Date()
    },
    releaseOrderNo:String,
    MHINo:String,
    MHIDate: Date,
    MHIGrossAmount:Number,
    MHITaxAmount:Number,

    mediahouseID: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"MediaHouse"
    },
    executiveID: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Executive"
    },
    clientID: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client"
    },
    
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
    });
    module.exports = mongoose.model('MediaHouseInvoice', MediaHouseInvoiceSchema);
    