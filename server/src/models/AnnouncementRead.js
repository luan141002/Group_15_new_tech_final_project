const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnnouncementReadSchema = new Schema({
    announcement: {
        type: Schema.Types.ObjectId,
        ref: 'Announcement',
        required: true
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    }
});

const AnnouncementRead = mongoose.model('AnnouncementRead', AnnouncementReadSchema);
module.exports = AnnouncementRead;
