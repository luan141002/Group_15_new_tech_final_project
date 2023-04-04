const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const ServerError = require('../utility/error');
const Schema = mongoose.Schema;

const options = { discriminatorKey: 'kind' };

const AccountSchema = new Schema({
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
    password: String,
    photo: Buffer,
    photoType: String,
    joined: {
        type: Date,
        required: true,
        default: Date.now
    },
    activated: {
        type: Boolean,
        required: false,
        default: false
    },
    inactive: {
        type: Boolean,
        required: true,
        default: false
    },
    accessCode: String,
    locked: {
        type: Boolean,
        default: false
    },
    status: String
}, options);

AccountSchema.pre('save', function(next) {
    const account = this;
    if (account.password && (this.isModified('password') || this.isNew)) {
        bcrypt.hash(account.password, 10, function(err, hash) {
            if (err) return next(err);
            account.password = hash;
            next();
        });
    } else {
        return next();
    }
});

AccountSchema.statics.hashPassword = async function(rawPassword) {
    return await bcrypt.hash(rawPassword, 10)
}

AccountSchema.statics.verifyPassword = async function(inputPassword, encodedPassword) {
    return await bcrypt.compare(inputPassword, encodedPassword)
}

AccountSchema.statics.authenticate = async function(email, password) {
    const query = { email };

    try {
        const account = await User.findOne(query);
        if (!account) throw new ServerError(401, 'error.auth.invalid_credentials', 'Invalid email/password');
        
        if (await bcrypt.compare(password, account.password)) {
            if (!account.activated) throw new ServerError(401, 'error.auth.not_activated', 'Account is not activated');
            return account;
        }
        
        throw new ServerError(401, 'error.auth.invalid_credentials', 'Invalid email/password');
    } catch (error) {
        throw error;
    }
}

const User = mongoose.model('Account', AccountSchema);

const Student = User.discriminator('Student', AccountSchema);
const Faculty = User.discriminator('Faculty', AccountSchema);
const Administrator = User.discriminator('Administrator', AccountSchema);

module.exports = {
    User,
    Student,
    Faculty,
    Administrator
};
