const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TODO: this indicates the current term
const TermSchema = new Schema({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    author: { type: Schema.Types.ObjectId, required: true, ref: 'Administrator' }
});

const Term = mongoose.model('Term', TermSchema);

module.exports = Term;
