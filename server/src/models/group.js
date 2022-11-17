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
    }
})

const Group = mongoose.model('Group', GroupSchema)
module.exports = Group
