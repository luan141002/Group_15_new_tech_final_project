const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ActivitySchema = new mongoose.Schema({
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    type: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    details: Object,
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    seen: Date
})

const Activity = mongoose.model('Activity', ActivitySchema)
module.exports = Activity
