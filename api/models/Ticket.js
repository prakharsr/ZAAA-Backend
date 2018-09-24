var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var TicketSchema = new mongoose.Schema({
    subject: String,
    details: String,
    user : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status: Number,
    firm:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Firm"
    },
});

TicketSchema.plugin(timestamps);
module.exports = mongoose.model('Ticket', TicketSchema);
