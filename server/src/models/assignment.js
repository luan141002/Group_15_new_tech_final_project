const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AssignmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    published: {
        type: Boolean,
        required: true,
        default: false
    },
    due: {
        type: Date, required: true
    },
    process: {
        type: Number,
        required: true,
        default: 1
    }
})

const Assignment = mongoose.model('Assignment', AssignmentSchema)
module.exports = Assignment
