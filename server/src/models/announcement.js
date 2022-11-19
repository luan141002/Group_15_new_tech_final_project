const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    uploadDate: {
        type: Date,
        required: true,
        default: Date.now,
    }
})

const Announcement = mongoose.model('Announcement', AnnouncementSchema)
module.exports = Announcement
