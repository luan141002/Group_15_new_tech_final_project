const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const options = { discriminatorKey: 'kind' }

const AccountSchema = new Schema({
    idnum: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    lastName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordEnc: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    photo: Buffer,
    joined: {
        type: Date,
        required: true,
        default: Date.now
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    verifyCode: {
        type: String,
        required: true
    }
}, options)

AccountSchema.pre('save', function(next) {
    const account = this
    if (this.isModified('passwordEnc') || this.isNew) {
        bcrypt.hash(account.passwordEnc, 10, function(err, hash) {
            if (err) return next(err)
            account.passwordEnc = hash
            next()
        })
    } else {
        return next()
    }
})

AccountSchema.statics.getBasicInfo = function(account) {
    return {
        id: account._id,
        idnum: account.idnum,
        lastName: account.lastName,
        firstName: account.firstName,
        middleName: account.middleName
    }
}

AccountSchema.statics.authenticate = async function(username, password) {
    const query = {
        username: { $regex: new RegExp(`^${username}$`, 'i') }
    }

    try {
        const account = await User.findOne(query)
        if (!account) throw 'Invalid username/password'
        
        if (await bcrypt.compare(password, account.passwordEnc)) {
            if (!account.verified) throw 'Account is not verified'
            return account
        }
        
        throw 'Invalid username/password'
    } catch (error) {
        throw error
    }
}

const User = mongoose.model('Account', AccountSchema)

const Student = User.discriminator('Student', new mongoose.Schema({
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    roles: {
        type: [String],
        enum: ['proponent']
    },
    process: {
        type: Number,
        default: 1
    }
}))

const Faculty = User.discriminator('Faculty', new mongoose.Schema({
    roles: {
        type: [String],
        enum: ['panelist', 'adviser', 'coordinator']
    }
}))

const Administrator = User.discriminator('Administrator', new mongoose.Schema({
    roles: {
        type: [String],
        enum: ['chair', 'secretary']
    },
    superadmin: {
        type: Boolean,
        default: false
    }
}))

module.exports = {
    User,
    Student,
    Faculty,
    Administrator
}
