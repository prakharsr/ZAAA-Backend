var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);



var InvoiceSchema = new mongoose.Schema({
    date: String,
    invoiceNO: {
        type:String,
        unique:true
    },
    agencyName: String,
    agencyAddress:String,
    agencyState:String,
    agencyGSTIN: String,
    agencyPerson: String,
    signature: String,
    publicationName:String,
    publicationEdition:String,
    publicationAddress:String,
    publicationCity:String,
    publicationState:String,
    clientName:String,
    clientAddress:String,
    clientCity:String,
    clientState:String,
    clientGSTIN:String,
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
    adScheme:StEmailIdring,
    adTotal:String,
    insertionDate:String,
    adGrossAmount:String,
    publicationDiscount:String,
    agencyDiscount1:String,
    agencyDiscount2:String,
    additonalCharges:String,
    taxAmount:String,
    netAmountFigures:String,
    netAmountWords:String,
    remark:String,
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
    });
    module.exports = mongoose.model('Invoice', InvoiceSchema);
    

