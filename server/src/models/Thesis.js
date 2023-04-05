const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThesisSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    authors: {
        type: [Schema.Types.ObjectId],
        ref: 'Student',
        required: true
    },
    advisers: {
        type: [Schema.Types.ObjectId],
        ref: 'Faculty',
        required: true
    },
    panelists: {
        type: [Schema.Types.ObjectId],
        ref: 'Faculty',
        required: true,
        default: []
    },
    locked: {
        type: Boolean,
        required: true,
        default: false
    },
    phase: {
        type: Number,
        required: true,
        default: 1
    },
    grades: [{
        value: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        phase: {
            type: Number,
            required: true
        },
        remarks: String,
        by: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }],
    remarks: String,
    status: {
        type: String,
        enum: [
            'new',
            'for_checking',
            'checked',
            'endorsed',
            'redefense',
            'pass',
            'fail',
            'final'
        ],
        default: 'new'
    }
});

const Thesis = mongoose.model('Thesis', ThesisSchema);
module.exports = Thesis;