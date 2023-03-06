const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubmissionSchema = new Schema({
    thesis: {
        type: Schema.Types.ObjectId,
        ref: 'Thesis',
        required: true
    },
    submitter: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    submitted: {
        type: Date,
        required: true,
        default: Date.now
    },
    attachments: [{
        originalName: String,
        data: Buffer,
        mime: String
    }],
    term: Number,
    status: String
});

const Submission = mongoose.model('Submission', SubmissionSchema);
module.exports = Submission;
