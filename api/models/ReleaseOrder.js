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
    agencyPerson: String,
    signature: String,
    publicationName:String,
    publicationEdition:String,
    publicationAddress:String,
    publicationCity:String,
    publicationState:String,
    publicationGSTIN:String,
    clientName:String,
    clientAddress:String,
    clientCity:String,
    clientState:String,
    adType:String,
    adCategory1:String,
    adCategory2:String,
    adCategory3:String,
    adCategory4:String,
    adCategory5:String,
    adCategory6:String,
    adHue:String,
    adSize:String,
    adTotalSpace:String,
    adEdition:String,
    adPosition:String,
    adScheme:String,
    adTotal:String,
    insertions:[{date:String, time:String, marked:Boolean, insertion_no:Number}],
    adGrossAmount:String,
    publicationDiscount:String,
    agencyDiscount1:String,
    agencyDiscount2:String,
    taxAmount:String,
    netAmountFigures:String,
    netAmountWords:String,
    caption:String,
    paymentDetails:String,
    executiveName:String,
    otherCharges:String,
    clientPayment:String,
    remark:String,
    paymentDetails:String,
    executiveName:String,
    otherCharges:String,
    clientPayment:String,
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
    });
    module.exports = mongoose.model('ReleaseOrder', ReleaseOrderSchema);
    