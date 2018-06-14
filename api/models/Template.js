var mongoose = require('mongoose');
var config = require('../../config');
var timestamps = require('mongoose-timestamp');

var TemplateSchema = new mongoose.Schema({
    name : String,
    url : String
});

TemplateSchema.plugin(timestamps);
module.exports = mongoose.model('Template', TemplateSchema);