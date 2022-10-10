const express = require('express')
const { User } = require('../models/user')
const crypto = require('crypto')
const Token = require('../models/token')
const readToken = require('../middleware/token')

const router = express.Router()

function generateAccessToken() {
    return crypto.randomBytes(24).toString('base64')
}

function generateVerifyToken(text) {
    const hasher = crypto.createHash('sha256')
    hasher.update(text)
    hasher.update(Date.now().toString())
    return hasher.digest('base64')
}

function base64(string) {
    return Buffer.from(string).toString('base64url')
}

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {
        const account = await User.authenticate(username, password)
        const now = new Date()
        
        const token = await Token.create({
            id: generateAccessToken(),
            account,
            expiresAt: new Date(now.getTime() + 60 * 60 * 1000)
        })

        return res.json({
            token: token.id
        })
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: 'Cannot log in' })
    }
})

router.post('/logout', readToken, async (req, res) => {
    const token = await Token.findOne({ id: req.token.id })
    token.invalidated = true
    await token.save()
    res.json({ message: 'Logged out' })
})

router.post('/register/student', async (req, res) => {
    const { username, email, password, accessCode } = req.body

    try {
        await User.create({ username, lastName, firstName, middleName, email, passwordEnc: password, verifyCode: accessCode })
        return res.json({ message: `Student has been registered` })
    } catch (err) {
        console.log(err)
        return res.status(401).json({ message: 'Could not register account' })
    }
})

router.post('/verify', async (req, res) => {
    const { username, verifyCode } = req.body

    const account = await User.findOne({ username })
    if (!account) {
        return res.status(401).json({ message: 'Invalid verify token' })
    }

    if (account.verified) {
        return res.json({ message: 'Already verified' })
    } else if (account.verifyCode === verifyCode) {
        account.verified = true
        
        await account.save()
        return res.json({ message: 'User verified' })
    } else {
        return res.status(401).json({ message: 'Invalid verify token' })
    }
})

module.exports = (app) => {
    app.use('/account', router)
}
