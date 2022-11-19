const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    }
})

const Notification = mongoose.model('Notification', NotificationSchema)
module.exports = Notification
