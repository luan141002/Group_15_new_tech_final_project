const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ScheduleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    period: {
        from: { type: Date, required: true },
        to: { type: Date, required: true }
    },
    repeat: String,
    time: {
        from: { type: Number, required: true },
        to: { type: Number, required: true }
    }
})

const Schedule = mongoose.model('Schedule', ScheduleSchema)
module.exports = Schedule
