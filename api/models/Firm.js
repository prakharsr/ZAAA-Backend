var mongoose = require('mongoose');
var config = require('../../config');
var 


var FirmSchema = new mongoose.Schema({
    name : String,
    users : [{
        type : User,
    }],

});