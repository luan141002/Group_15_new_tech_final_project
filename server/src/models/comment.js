const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new mongoose.Schema({
    target: {
        type: Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
