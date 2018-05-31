var mongoose = require('mongoose');
var config = require('../../config');

var ClientNoteSchema = new mongoose.Schema({
    type: Number,
    clientName: String,
    invoiceNO: String,
    amount: Number,
    remark: String,
    date: {
        day:String,
        month:String,
        year:String
    },
    DocId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Invoice"
    },
    firm: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

module.exports = mongoose.model('ClientNote', ClientNoteSchema);