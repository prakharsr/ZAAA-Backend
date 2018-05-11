var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);



var ReleaseOrderSchema = new mongoose.Schema({
    date: String,
    // releaseOrderNO: {
    //     type:String,
    //     unique:true
    // },
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
    publicationGSTIN:{
        GSTType:String,
        GSTNo:String
    },    
    clientName:String,
    clientState:String,
    clientGSTIN:{
        GSTType:String,
        GSTNo:String
    },

    PremiumCustom:{
        Amount:Number,
        Percentage:Boolean,
        PremiumType:String
    },
    PremiumBox:{
        Amount:Number,
        Included:Boolean
    },
    PremiumBaseColour:{
        Amount:Number,
        Included:Boolean
    },
    PremiumEmailId:{
        Amount:Number,
        Quantity:Number,
        Included:Boolean
    },
    PremiumCheckMark:{
        Amount:Number,
        Included:Boolean
    },
    PremiumWebsite:{
        Amount:Number,
        Quantity:Number,
        Included:Boolean
    },
    PremiumExtraWords:{
        Amount:Number,
        Quantity:Number,
        Included:Boolean
    },

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
    AdWords:String,
    AdWordsMax:String,
    AdDuration:String,
    adSizeL:String,
    adSizeW:String,
    adSizeCustom:Boolean,
    adSizeAmount:String,
    AdTime:String,
    adTotalSpace:String,
    adEdition:String,
    adPosition:String,
    adSchemePaid:String,
    adSchemeFree:String,
    adTotal:String,
    
    insertions:[{date:{day:String,month:String,year:String}, marked:Boolean}],
    adGrossAmount:String,
    publicationDiscount:String,
    agencyDiscount1:String,
    agencyDiscount2:String,
    taxAmount:{
        primary:String,
        secondary:String
    },
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
    otherCharges:[
    {
        amount:String,
        chargeType:String,
    }
    ],
    executiveName:String,
    executiveOrg:String,
    otherRemark:String,
    FinalAmount:String,
    FinalTaxAmount:String,
    mediahouseID: String,
    executiveID: String,
    clientID: String,
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
    });
    module.exports = mongoose.model('ReleaseOrder', ReleaseOrderSchema);
    