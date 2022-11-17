const Accounts = require('../models/account')

module.exports.initialize = async function() {
    const admin = await Accounts.Administrator.findOne({ username: 'admin' })
    if (!admin) {
        await Accounts.Administrator.create({
            idnum: '1',
            username: 'admin',
            lastName: 'Admin',
            firstName: 'Admin',
            email: 'admin@example.com',
            passwordEnc: 'thesis!',
            startDate: new Date(0),
            endDate: new Date(10000 * 365 * 86400 * 1000),
            verified: true,
            verifyCode: '0'
        })
    }
}
