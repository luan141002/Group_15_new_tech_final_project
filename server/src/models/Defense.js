const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DefenseSchema = new Schema({
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    thesis: {
        type: Schema.Types.ObjectId,
        ref: 'Thesis',
        required: true
    },
    panelists: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Faculty'
        }
    ],
    term: Number
});

const Defense = mongoose.model('Defense', DefenseSchema);

module.exports = Defense;
