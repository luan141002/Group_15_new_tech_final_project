const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubmissionSchema = new mongoose.Schema({
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    assignment: {
        type: Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    submitter: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    submitDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endorsements: [{
        by: { type: Schema.Types.ObjectId, required: true, ref: 'Faculty' },
        when: { type: Date, required: true, default: Date.now }
    }],
    approval: {
        by: { type: Schema.Types.ObjectId, ref: 'Faculty' },
        when: { type: Date, default: Date.now }
    }
})

const Submission = mongoose.model('Submission', SubmissionSchema)
module.exports = Submission
