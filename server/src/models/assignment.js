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
    available: {
        from: Date,
        to: Date
    },
    due: {
        type: Date, required: true
    }
})

const Assignment = mongoose.model('Submission', AssignmentSchema)
module.exports = Assignment
