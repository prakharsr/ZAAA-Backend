var mongoose = require('mongoose');
var config = require('../../config');
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
        state:Number,
        collectedAmount:Number,
        pendingAmount:Number,
        receiptNumber:String,
        receiptDate:String,
        paymentMode:String,
        paymentDate:Date,
        paymentNo:String,
        paymentAmount:Number,
        paymentBankName:String,
        batchID:String
    }
    ],
    date: {
        type: Date,
        default: new Date()
    },
    releaseOrderNO:String,
    MHINo:String,
    MHIDate: Date,
    MHIGrossAmount:Number,
    MHITaxAmount:Number,
    taxType:String,
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
MediaHouseInvoiceSchema.plugin(timestamps);
    module.exports = mongoose.model('MediaHouseInvoice', MediaHouseInvoiceSchema);
    