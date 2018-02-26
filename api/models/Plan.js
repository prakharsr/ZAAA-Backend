var mongoose = require('mongoose');
var config = require('../../config');

var PlanSchema = new mongoose.Schema({
    cost : Number,
    name : String,
    maxUsers : Number,
    maxAdmins : Number,
    description : String 
});

module.exports = mongoose.model('Plan', PlanSchema);