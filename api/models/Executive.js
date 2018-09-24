var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');


 
var ExecutiveSchema = new mongoose.Schema({
    OrganizationName:
            {
                type:String,
                required: true
            },
    CompanyName:String,
    ExecutiveName:
            {
                type:String,
                required: true
            },
    Designation:String,
    Department:String,
    MobileNo:String,
    EmailId:String, 
    Photo:{
        type:String,
        default:'/images/profile.jpg'
    },
    DateOfBirth:Date,
    Anniversary:Date,
    Remark:String,
    firm : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
    
});
ExecutiveSchema.plugin(timestamps);
ExecutiveSchema.index({firm:1,OrganizationName: 1, ExecutiveName:1 }, {unique: true});
module.exports = mongoose.model('Executive', ExecutiveSchema);

