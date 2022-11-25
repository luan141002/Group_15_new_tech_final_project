const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'Student',
        required: true
    },
    advisers: {
        type: [Schema.Types.ObjectId],
        ref: 'Faculty',
        required: true
    },
    panelists: {
        type: [Schema.Types.ObjectId],
        ref: 'Faculty',
        required: true
    },
    grades: [{
        value: { type: String, required: true },
        process: { type: Schema.Types.ObjectId, ref: 'Process', required: true },
        by: { type: Schema.Types.ObjectId, ref: 'Account', required: true }
    }],
    currentProcess: {
        type: Schema.Types.ObjectId,
        ref: 'Process'
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
})

const Group = mongoose.model('Group', GroupSchema)
module.exports = Group
