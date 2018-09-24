var mongoose = require('mongoose');
var config = require('../../config');
var timestamps = require('mongoose-timestamp');

var ReceiptSchema = new mongoose.Schema({
    
    advanced:Boolean,
    receiptNO:String,
    invoiceID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Invoice"
    },
    date: {
        type: Date,
        default: new Date()
    },
    agencyName: String,
    agencyGSTIN: String,
    agencyPin:String,
    agencyAddress:String,
    agencyState:String,
    agencyPerson: String,
    signature: String,

    publicationName:String,
    publicationEdition:String,
    mediaType:String,
    publicationState:String,
    publicationGSTIN:String,
    
    clientName:String,
    clientState:String,
    clientGSTIN:String,
    executiveName:String,
    executiveOrg:String,

    /*fields of release order to come */
    adGrossAmount:Number,
    taxType:String,
    taxAmount:{
        primary:String,
        secondary:String
    },
    taxIncluded:Boolean,
    otherCharges:[
        {
            amount:Number,
            chargeType:String,
        }
    ],
    /* upto here */
    exceedingAmount:Number,


    /*fields of Invoice, which are to be filled on invoice creation,
     to be filled by default with values of respective feilds in release Order*/
    extraCharges:{
        amount:Number,
        percentage : Boolean
    },
    publicationDiscount:String,
    agencyDiscount1:String,
    agencyDiscount2:String,
    additionalCharges:String,

    /*upto here */
    
    additionalTax:String,
    
    caption:String,
    remark:String,
    otherRemark:String,
    FinalAmount:Number,
    FinalTaxAmount:Number,
    netAmountFigures:Number,
    netAmountWords:String,


    /*may be omitted, not discussed yet */
    paymentType:String,
    paymentDate:Date,
    paymentNo:String,
    paymentAmount:Number,
    originalAmount:Number,
    originalReceiptNo : String,
    originalReceiptDate: Date,
    linked: {
        type: Boolean,
        default:false
    },
    paymentBankName:String,
    paymentAmountWords:String,

    status:{
        type:Number,
        default:0
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
,
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
    flogo: String,
    fsign: String,
    fjuris: String,
    faddress:{
        pincode:String,
        address:String,
        city:String,
        state:String
    },
    fmobile: String,
    femail: String,
    tnc: String
    });
    
ReceiptSchema.plugin(timestamps);
    module.exports = mongoose.model('Receipt', ReceiptSchema);
    