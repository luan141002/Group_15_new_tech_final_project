const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new mongoose.Schema({
    document: {
        type: Schema.Types.ObjectId,
        ref: 'Document'
    },
    submission: {
        type: Schema.Types.ObjectId,
        ref: 'Submission',
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
})

const Comment = mongoose.model('Comment', CommentSchema)
module.exports = Comment
