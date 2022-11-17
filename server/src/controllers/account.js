const express = require('express')
const { User } = require('../models/account')
const Account = require('../models/account')
const crypto = require('crypto')
const Token = require('../models/token')
const readToken = require('../middleware/token')
const { checkKind, checkRole } = require('../middleware/role')
const { generateName } = require('../utility/name')
const ServerError = require('../error')
const jwt = require('jsonwebtoken')

const router = express.Router()

function generateVerifyToken(text) {
    const hasher = crypto.createHash('sha256')
    hasher.update(text)
    hasher.update(Date.now().toString())
    return hasher.digest('base64')
}

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {
        const account = await User.authenticate(username, password)

        const accountType = (account.kind || '').toLowerCase()
        const accountInfo = {
            id: account._id,
            idnum: account.idnum,
            lastName: account.lastName,
            firstName: account.firstName,
            kind: accountType,
            roles: account.roles || []
        }
        const tokenInfo = {
            account: accountInfo
        }
        const jwtoken = jwt.sign(tokenInfo, process.env.JWT_SECRET, {
            expiresIn: `${process.env.JWT_DURATION}s` || 86400
        })

        return res
            .json({
                token: jwtoken,
                account: accountInfo
            })
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: 'Cannot log in' })
    }
})

router.get('/checkToken', readToken, async (req, res) => {
    return res.sendStatus(200)
})

router.post('/logout', readToken, async (req, res) => {
    const token = await Token.findOne({ id: req.token.id })
    token.invalidated = true
    await token.save()
    res.json({ message: 'Logged out' })
})

function createUserFromBody(type, body) {
    const { idnum, username, lastName, firstName, middleName, email, password, startDate, endDate } = body

    if (!idnum) throw new ServerError(400, 'ID Number is required')
    if (!lastName) throw new ServerError(400, 'Last name is required')
    if (!firstName) throw new ServerError(400, 'First name is required')
    if (!email) throw new ServerError(400, 'Email is required')
    if (!password) throw new ServerError(400, 'Password is required')

    let uname = username || generateName(lastName, firstName)

    let startDateObj = new Date(0)
    let endDateObj = new Date(10000 * 365 * 86400 * 1000)
    if (startDate) startDateObj = new Date(startDate)
    if (endDate) endDateObj = new Date(endDate)

    const user = {
        idnum,
        username: uname,
        lastName,
        firstName,
        middleName,
        email,
        passwordEnc: password,
        startDate: startDateObj,
        endDate: endDateObj,
        verified: false,
        verifyCode: '0'
    }

    if (type === 'student') {
        user.verifyCode = generateVerifyToken(uname)
    } else {
        user.verified = true
    }

    return user
}

router.post('/add/administrator', readToken, checkKind('administrator'), async (req, res) => {
    try {
        const user = createUserFromBody('administrator', req.body)
        await Account.Administrator.create(user)

        return res.json({
            message: `Administrator has been registered`,
            details: {
                username: user.username,
                lastName: user.lastName,
                firstName: user.firstName,
                email: user.email
            }
        })
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }

        if (err.code === 11000) {
            if (err.message.includes('idnum')) {
                return res.status(400).json({ message: 'Another account with the same ID number exists' })
            }
            if (err.message.includes('email')) {
                return res.status(400).json({ message: 'Another account with the same email exists' })
            }
            if (err.message.includes('username')) {
                return res.status(400).json({ message: 'Another account with the same username exists' })
            }
        }

        console.log(err)
        return res.status(500).json({ message: 'Could not register administrator account' })
    }
})

router.post('/add/faculty', readToken, checkKind('administrator'), async (req, res) => {
    try {
        const user = createUserFromBody('faculty', req.body)
        await Account.Faculty.create(user)

        return res.json({
            message: `Faculty has been registered`,
            details: {
                username: user.username,
                lastName: user.lastName,
                firstName: user.firstName,
                email: user.email
            }
        })
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }

        if (err.code === 11000) {
            if (err.message.includes('idnum')) {
                return res.status(400).json({ message: 'Another account with the same ID number exists' })
            }
            if (err.message.includes('email')) {
                return res.status(400).json({ message: 'Another account with the same email exists' })
            }
            if (err.message.includes('username')) {
                return res.status(400).json({ message: 'Another account with the same username exists' })
            }
        }

        console.log(err)
        return res.status(500).json({ message: 'Could not register faculty account', details: err })
    }
})

router.post('/add/student', readToken, checkKind(['faculty', 'administrator']), async (req, res) => {
    try {
        const user = createUserFromBody('student', req.body)
        await Account.Student.create(user)

        console.log(`Student can be verified using token ${user.verifyToken}`)
        return res.json({
            message: `Student has been registered`,
            details: {
                username: user.username,
                lastName: user.lastName,
                firstName: user.firstName,
                email: user.email
            }
        })
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }

        if (err.code === 11000) {
            if (err.message.includes('idnum')) {
                return res.status(400).json({ message: 'Another account with the same ID number exists' })
            }
            if (err.message.includes('email')) {
                return res.status(400).json({ message: 'Another account with the same email exists' })
            }
            if (err.message.includes('username')) {
                return res.status(400).json({ message: 'Another account with the same username exists' })
            }
        }

        console.log(err)
        return res.status(500).json({ message: 'Could not register student account', details: err })
    }
})

router.delete('/delete/student/:id', readToken, checkKind(['faculty', 'administrator']), async (req, res) => {
    const idnum = req.params.id
    try {
        await Account.Student.deleteOne({ idnum })
        return res.json({ message: `Student has been removed` })
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }

        console.log(err)
        return res.status(500).json({ message: 'Could not remove account', details: err })
    }
})

router.delete('/delete/faculty/:id', readToken, checkKind('administrator'), async (req, res) => {
    const idnum = req.params.id
    try {
        await Account.Faculty.deleteOne({ idnum })
        return res.json({ message: `Faculty has been removed` })
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }

        console.log(err)
        return res.status(500).json({ message: 'Could not remove account', details: err })
    }
})

router.delete('/delete/administrator/:id', readToken, checkKind('administrator'), async (req, res) => {
    const idnum = req.params.id
    try {
        await Account.Administrator.deleteOne({ idnum })
        return res.json({ message: `User has been removed` })
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }

        console.log(err)
        return res.status(500).json({ message: 'Could not remove account', details: err })
    }
})

router.get('/users', async (req, res) => {
    const { type } = req.query

    let kind = Account.User
    switch (type) {
        case 'student':
            kind = Account.Student
            break
        case 'faculty':
            kind = Account.Faculty
            break
        case 'administrator':
            kind = Account.Administrator
            break
        case 'user':
            kind = Account.User
            break
        default:
            return res.json([])
    }

    const list = await kind.find()
    return res.json(list)
})

router.post('/verify', async (req, res) => {
    const { username, verifyCode } = req.body

    try {
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
    } catch (error) {
        return res.status(500).json({ message: 'Cannot verify user', details: error })
    }
})

module.exports = (app) => {
    app.use('/account', router)
}
