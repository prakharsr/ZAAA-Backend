var mongoose = require('mongoose');
var config = require('../../config');
var bcrypt = require('bcrypt');
var authy = require('authy')(config.authyKey);
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var timestamps = require('mongoose-timestamp');


var ReleaseOrderSchema = new mongoose.Schema({
    date: {
        type:Date,
        default:new Date()
    },
    releaseOrderNO:String,
    invoiceSerial:{
        type: Number,
        default: 0
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

    pulloutName: String,
    fixRate: Boolean,

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
    
    insertions:[
        {
            date:{day:String,month:String,year:String},
            marked:{type:Boolean, default: false},
            state:{type:Number, default: 0},
            Amount:{
                type:Number,
                default:0
            },
            mhimarked:{type:Boolean, default: false},
            ISODate: Date,

            netAmount:Number,
            taxAmount:Number
        }
    ],
    adGrossAmount:Number,
    publicationDiscount:Number,
    agencyDiscount1:Number,
    agencyDiscount2:Number,
    taxAmount:{
        primary:Number,
        secondary:Number
    },
    taxIncluded:Boolean,
    netAmountFigures:Number,
    netAmountWords:String,
    caption:String,
    remark:String,
    
    paymentType:String,
    paymentDate:Date,
    paymentNo:String,
    paymentAmount:Number,
    paymentBankName:String,
    otherCharges:[
        {
            amount:Number,
            chargeType:String,
        }
    ],
    executiveName:String,
    executiveOrg:String,
    otherRemark:String,
    FinalAmount:Number,
    FinalTaxAmount:Number,
    mediahouseInvoices:[{
        insertionId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'ReleaseOrder.insertions.$'
        },
        invoiceNo:String,
        invoiceDate:String,
        invoiceAmount:Number
    }],
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
    template: String,
    generated:{
        type: Boolean,
        default: false
    },
    cancelled:{
        type: Boolean,
        default: false
    },
    generatedAt: Date,

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

ReleaseOrderSchema.pre('save', function(next){
    var self = this;
    var insertions = self.insertions;
    if(self.insertions.length == 0){
        return next(new Error('Please select insertions'));
    }
    else{
        insertions.forEach(element => {
            var date = element.date;
            element.ISODate = new Date(""+date.month+" "+date.day+" "+date.year+" 00:00 UTC");  
            var amount =  ((+self.adGrossAmount) + ((+self.taxAmount.primary + +self.taxAmount.secondary) * (+self.adGrossAmount/100)) * (!self.taxIncluded))/insertions.length;
            var netamount = self.taxIncluded?((100*self.netAmountFigures)/(100 + (+self.taxAmount.primary + +self.taxAmount.secondary))/insertions.length) :self.netAmountFigures/insertions.length;
            var taxamount = self.taxIncluded?((self.netAmountFigures*(+self.taxAmount.primary + +self.taxAmount.secondary))/(100 + (+self.taxAmount.primary + +self.taxAmount.secondary)) / insertions.length) :(self.netAmountFigures*(+self.taxAmount.primary + +self.taxAmount.secondary)/100)/insertions.length;         
            element.Amount = Math.round(amount*100)/100;
            element.netAmount = Math.round(netamount*100)/100;
            element.taxAmount = Math.round(taxamount*100)/100;
            next();
        });
    }
});


ReleaseOrderSchema.index({releaseOrderNO:1,firm: 1}, {unique: true});
ReleaseOrderSchema.plugin(timestamps);
module.exports = mongoose.model('ReleaseOrder', ReleaseOrderSchema);
