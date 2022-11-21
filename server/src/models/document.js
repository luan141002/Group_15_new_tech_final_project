const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DocumentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    type: String,
    uploader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data: {
        type: Buffer,
        required: true
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    submission: {
        type: Schema.Types.ObjectId,
        ref: 'Submission'
    },
    uploadDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    processed: [{
        by: { type: Schema.Types.ObjectId, required: true, ref: 'Faculty' },
        when: { type: Date, required: true, default: Date.now }
    }]
})

const Document = mongoose.model('Document', DocumentSchema)
module.exports = Document
