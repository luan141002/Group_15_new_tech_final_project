const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProcessSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    period: {
        start: { type: Date, required: true },
        end: { type: Date, required: true }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Administrator'
    },
    createDate: {
        type: Date,
        required: true,
        default: Date.now,
    }
})

const Process = mongoose.model('Process', ProcessSchema)
module.exports = Process
