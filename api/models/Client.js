var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var ClientSchema = new mongoose.Schema({
    OrganizationName:
            {
                type:String,
                required: true
            },
    CompanyName:String,
    NickName:String,
    CategoryType:String,
    SubCategoryType:String,
    Address:{
        pincode:String,
        address:String,
        city:String,
        state:String
    },
    stdNo:String,
    Landline:String,
    Website:String,
    PanNO:String,
    IncorporationDate:Date,
    GSTIN:{
        GSTType:{
            type:String,
            default:'URD'
        },
        GSTNo:{
            type:String,
            default:''
        },
    },
    ContactPerson:[{
        Name:String,
        Designation:String,
        Department:String,
        MobileNo:String,
        stdNo:String,
        Landline:String,
        EmailId:String,
        Photo:{
            type: String,
            default: '/images/profile.jpg'
        },
        DateOfBirth:Date,
        Anniversary:Date    
    }],
    Remark:String,
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm",
        required:true
    },
});
ClientSchema.index({firm:1,OrganizationName:1}, {unique: true});
ClientSchema.plugin(timestamps);
module.exports = mongoose.model('Client', ClientSchema);
