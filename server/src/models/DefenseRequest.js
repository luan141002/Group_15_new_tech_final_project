const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DefenseRequestSchema = new Schema({
    thesis: {
        type: Schema.Types.ObjectId,
        ref: 'Thesis',
        required: true
    },
    term: {
        type: String,
        required: true
    },
    phase: {
        type: Number,
        required: true
    },
    by: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    lastUpdated: {
        type: Date,
        required: true,
        default: Date.now
    },
    adviserApproved: {
        type: Boolean,
        required: true,
        default: false
    },
    approved: {
        type: Boolean,
        required: true,
        default: false
    },
    status: {
        type: String,
        enum: [
            'pending',
            'declined',
            'confirmed'
        ],
        default: 'pending'
    },
    freeSlots: [{
        start: { type: Date, required: true },
        end: { type: Date, required: true }
    }]
});

const DefenseRequest = mongoose.model('DefenseRequest', DefenseRequestSchema);

module.exports = DefenseRequest;
