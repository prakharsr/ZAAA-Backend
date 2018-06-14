var mongoose = require('mongoose');
var config = require('../../config');
var timestamps = require('mongoose-timestamp');
var PlanSchema = new mongoose.Schema({
    cost : Number,
    name : String,
    maxUsers : Number,
    maxAdmins : Number,
    description : String,
    validAgain: Boolean
});


PlanSchema.plugin(timestamps);
module.exports = mongoose.model('Plan', PlanSchema);