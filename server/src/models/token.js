const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TokenSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    kind: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    invalidated: {
        type: Boolean,
        required: true,
        default: false
    }
})

const Token = mongoose.model('Token', TokenSchema)
module.exports = Token
