var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);



var InvoiceSchema = new mongoose.Schema({
    
    invoiceNO:String,
    releaseOrderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ReleaseOrder"
    },
    date: {
        type: Date,
        default: new Date()
    },
    receiptSerial: {
        type: Number,
        default: 0
    },
    agencyName: String,
    agencyGSTIN: {
        GSTType: String,
        GSTNo:String
    },
    agencyPin:String,
    agencyAddress:String,
    agencyState:String,
    agencyPerson: String,
    signature: String,

    publicationName:String,
    publicationEdition:String,
    mediaType:String,
    publicationState:String,
    publicationGSTIN:{
        GSTType: String,
        GSTNo:String
    },
    
    clientName:String,
    clientState:String,
    clientGSTIN:{
        GSTType: String,
        GSTNo:String
    },
    executiveName:String,
    executiveOrg:String,


    /*fields of release order to come */
    adGrossAmount:String,
    taxType:String,
    taxAmount:{
        primary:String,
        secondary:String
    },
    taxIncluded:Boolean,
    otherCharges:[
        {
            amount:String,
            chargeType:String,
        }
    ],
    /* upto here */


    /*fields of Invoice, which are to be filled on invoice creation,
     to be filled by default with values of respective feilds in release Order*/
    extraCharges:{
        amount:Number,
        percentage : Boolean
    },
    publicationDiscount:{
        amount : Number,
        percentage:Boolean
    },
    agencyDiscount1:
    {
        amount:Number,
        percentage: Boolean
    },
    // agencyDiscount2:
    // {
    //     amount:Number,
    //     percentage: Boolean
    // },
    additionalCharges:{
        amount:Number,
        percentage:Boolean
    },

    /*upto here */
    
    // additionalTax:String,
    
    caption:String,
    remark:String,
    otherRemark:String,
    FinalAmount:String,
    FinalTaxAmount:String,
    netAmountFigures:String,
    netAmountWords:String,


    /*for payment reciept */
    clearedAmount:{
        type: Number,
        default: 0
    },
    collectedAmount:{
        type: Number,
        default: 0
    },
    pendingAmount:Number,
    exceedingAmount:{
        type: Number,
        default: 0
    },
    /*          */
    
    /* only marked insertions , kept for date purpose for invoice*/
    insertions:[{date:{day:String,month:String,year:String}, marked:Boolean}],

 

    /*may be omitted, not discussed yet */
    paymentType:String,
    paymentDate:String,
    paymentNo:String,
    paymentAmount:String,
    paymentBankName:String,

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
    module.exports = mongoose.model('Invoice', InvoiceSchema);
    