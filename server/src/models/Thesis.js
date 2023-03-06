const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThesisSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
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
            'for_checking',
            'endorsed',
            'redefense',
            'pass',
            'fail',
        ],
        default: 'for_checking'
    }
});

const Thesis = mongoose.model('Thesis', ThesisSchema);
module.exports = Thesis;
