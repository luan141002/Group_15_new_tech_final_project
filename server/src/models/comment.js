const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    thesis: {
        type: Schema.Types.ObjectId,
        ref: 'Thesis',
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
    sent: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
