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
    grades: [{
        value: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: [
            'for_checking',
            'approved'
        ],
        default: 'for_checking'
    }
});

const Thesis = mongoose.model('Thesis', ThesisSchema);
module.exports = Thesis;
