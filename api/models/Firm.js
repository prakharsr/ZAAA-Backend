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
        address:String,
        city:String,
        state:String
    },
    IncorporationDate: Date,
    OfficeAddress:{
        address:String,
        city:String,
        state:String
    },
    Fax:String,
    Mobile: String,
    Email:String,
    Landline: String,
    Website:String,
    PanNo: String,
    GSTIN: String,
    BankDetails:{
        AccountName:String,
        AccountNo:String,
        BankName:String,
        IFSC:String,
        BranchAddress:String,
        AccountType:String  
    },
    
    templates : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Template"
    }],
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