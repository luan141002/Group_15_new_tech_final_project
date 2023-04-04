const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DefenseSchema = new Schema({
    description: String,
    thesis: {
        type: Schema.Types.ObjectId,
        ref: 'Thesis',
        required: true
    },
    phase: {
        type: Number,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    panelists: [
        /* This includes the adviser */
        {
            faculty: {
                type: Schema.Types.ObjectId,
                ref: 'Faculty',
                required: true
            },
            approved: {
                type: Boolean,
                required: true,
                default: false
            },
            declined: Boolean
        }
    ],
    status: {
        type: String,
        required: true,
        enum: [
            'pending',
            'declined',
            'approved',
            'confirmed'
        ],
        default: 'pending'
    },
    term: String
});

const Defense = mongoose.model('Defense', DefenseSchema);

module.exports = Defense;
