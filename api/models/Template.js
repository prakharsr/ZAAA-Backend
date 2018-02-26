var mongoose = require('mongoose');
var config = require('../../config');

var TemplateSchema = new mongoose.Schema({
    name : String,
    url : String
});

module.exports = mongoose.model('Template', TemplateSchema);