var mongoose = require('mongoose');
var config = require('../../config');

var NoteSchema = new mongoose.Schema({
    type: Number,
    partyName: String,
    docNumber: String,
    amount: Number,
    remark: String,
    date: {
        day:String,
        month:String,
        year:String
    },
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

module.exports = mongoose.model('Note', NoteSchema);