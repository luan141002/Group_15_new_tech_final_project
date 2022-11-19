const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DocumentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    uploader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data: {
        type: Buffer,
        required: true
    },
    submission: {
        type: Schema.Types.ObjectId,
        ref: 'Submission'
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    submittedAt: Date,
    receivedAt: Date,
    processedAt: Date,
    approvedAt: Date,
    endorsed: {
        type: Boolean,
        default: false
    },
    approved: {
        type: Boolean,
        default: false
    }
})

const Document = mongoose.model('Document', DocumentSchema)
module.exports = Document
