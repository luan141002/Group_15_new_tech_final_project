const mongoose = require('mongoose');

// TODO: this should have been used for reminding the user about activity like thesis or defense updates
const EmailTemplateSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true }
}, { _id: false });

const EmailTemplate = mongoose.model('EmailTemplate', EmailTemplateSchema);
module.exports = EmailTemplate;
