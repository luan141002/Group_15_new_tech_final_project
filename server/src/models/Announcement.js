const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnnouncementSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Administrator',
        required: true
    },
    title: {
        type: String,
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
    },
    filterUserTypes: [String],
    filterPhase: Number
});

const Announcement = mongoose.model('Announcement', AnnouncementSchema);
module.exports = Announcement;
