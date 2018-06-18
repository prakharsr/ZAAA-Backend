var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var ReleaseOrder = require('./ReleaseOrder');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var timestamps = require('mongoose-timestamp');

var MediaHouseInvoiceSchema = new mongoose.Schema({

    publicationName:String,
    publicationEdition:String,
    mediaType:String,
    publicationState:String,
    publicationGSTIN:{
        GSTType:String,
        GSTNo:String
    },
    releaseOrderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ReleaseOrder"
    },
    insertions:[
        {
        insertionId:{type:mongoose.Schema.Types.ObjectId, ref:"ReleaseOrder.insertions.$"},
        insertionDate: Date,
        Amount:Number,
        collectedAmount:Number,
        pendingAmount:Number,
        recieptNumber:String,
        recieptDate:String,
        paymentMode:String,
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

    MediaHouseInvoiceSchema.pre('save', function(next){
        self= this;
        ReleaseOrder.update({releaseOrderId: self.releaseOrderId},{$push: {mediaHouseInvoices: self._id}});
        self.insertions.forEach(element => {
            element.Amount = (self.MHIGrossAmount + self.MHITaxAmount)/self.insertions.length;
        });
        next();
    })

    
MediaHouseInvoiceSchema.plugin(timestamps);
    module.exports = mongoose.model('MediaHouseInvoice', MediaHouseInvoiceSchema);
    