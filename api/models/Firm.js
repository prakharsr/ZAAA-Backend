var mongoose = require('mongoose');
var config = require('../../config');



var FirmSchema = new mongoose.Schema({
    FirmName : String,
    TagLine: String,
    DisplayName: String,
    admins : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    co_users : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    LogoURL : {
        type:String,
        default:'/images/logo.png'
    },
    RegisteredAddress:{
        pincode:String,
        address:String,
        city:String,
        state:String
    },
    IncorporationDate: Date,
    OfficeAddress:{
        pincode:String,
        address:String,
        city:String,
        state:String
    },
    Fax:String,
    Mobile: String,
    OtherMobile:String,
    Email:String,
    Landline: String,
    stdNo:String,
    Website:String,
    PanNo: String,
    GSTIN: {   
        GSTType:String,
        GSTNo:String
    },
    ROSerial:{
        type: Number,
        default: 0
    },
    AdvReceiptSerial:{
        type: Number,
        default: 0
    },
    BankDetails:{
        AccountName:String,
        AccountNo:String,
        BankName:String,
        IFSC:String,
        BranchAddress:String,
        AccountType:String  
    },
    ROTemplate:{
        type:String,
        default:"images/ReleaseOrder-1.jpg"
    },
    INTemplate:{
        type:String,
        default:"images/Invoice-1.jpg"
    },
    PRTemplate:{
        type:String,
        default:"images/PaymentReceipt-1.jpg"
    },
    plan : {
        createdOn: Date,
        paymentID : String,
        planID : {type:mongoose.Schema.Types.ObjectId, ref:"Plan"} 
    },
    Socials:{
        fb:String,
        twitter:String,
        Others:String
    },
});


module.exports = mongoose.model('Firm', FirmSchema);