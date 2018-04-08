var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);



var ReleaseOrderSchema = new mongoose.Schema({
    date: String,
    releaseOrderNO: {
        type:String,
        unique:true
    },
    agencyName: String,
    agencyGSTIN: String,
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
    adType:String,
    rate:String,
    unit:String,
    adCategory1:String,
    adCategory2:String,
    adCategory3:String,
    adCategory4:String,
    adCategory5:String,
    adCategory6:String,
    adHue:String,
    adSizeL:String,
    adSizeW:String,
    adTime:String,
    adTotalSpace:String,
    adEdition:String,
    adPosition:String,
    adSchemePaid:String,
    adSchemeFree:String,
    adTotal:String,
    insertions:[{date:String, time:String, marked:Boolean, insertion_no:Number}],
    adGrossAmount:String,
    publicationDiscount:String,
    agencyDiscount1:String,
    agencyDiscount2:String,
    taxAmount:String,
    taxIncluded:Boolean,
    netAmountFigures:String,
    netAmountWords:String,
    caption:String,
    remark:String,

    paymentType:String,
    paymentDate:String,
    paymentNo:String,
    paymentAmount:String,
    paymentBankName:String,

    executiveName:String,
    executiveOrg:String,
    otherCharges:String,
    otherChargesType:String,
    clientPayment:String,
    remark:String,
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
    });
    module.exports = mongoose.model('ReleaseOrder', ReleaseOrderSchema);
    