
var MediaHouseNoteSchema = new mongoose.Schema({
    type: Number,
    publicationName: String,
    publicationState: STring,

    releaseOrderNO: String,
    amount: Number,
    remark: String,
    date: {
        day:String,
        month:String,
        year:String
    },
    DocId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"ReleaseOrderId"
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

module.exports = mongoose.model('MediaHouseNote', MediaHouseNoteSchema);