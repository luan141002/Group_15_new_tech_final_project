const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true }
}, { _id: false });

const EmailTemplate = mongoose.model('EmailTemplate', EmailTemplateSchema);
module.exports = EmailTemplate;
