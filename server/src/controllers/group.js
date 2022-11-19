const express = require('express')
const { User } = require('../models/account')
const Account = require('../models/account')
const crypto = require('crypto')
const Token = require('../models/token')
const readToken = require('../middleware/token')
const { checkKind, checkRole } = require('../middleware/role')
const { generateName } = require('../utility/name')
const Group = require('../models/group')

const router = express.Router()

router.get('/', readToken, checkKind(['faculty', 'student']), async (req, res) => {
    const { account } = req.token
    try {
        const groups = await Group.find({ $or: [ { members: account }, { advisers: account } ] })
        return res.json(groups)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get groups for user' })
    }
})

router.get('/all', readToken, checkKind(['faculty', 'administrator']), async (req, res) => {
    try {
        const groups = await Group.find()
        return res.json(groups)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get groups' })
    }
})

router.post('/create', readToken, checkKind(['faculty', 'administrator']), async (req, res) => {
    const { name, advisers, members } = req.body

    try {
        const group = await Group.create({ name, advisers, members })
        return res.json({
            message: 'Group created',
            group: {
                id: group._id,
                name
            }
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not create group', details: err })
    }
})

router.post('/:id', readToken, checkKind(['faculty', 'administrator']), async (req, res) => {
    const { id } = req.params
    const { name, advisers, members } = req.body

    try {
        const group = await Group.findById(id)
        group.name = name
        group.advisers = advisers
        group.members = members
        await group.save()
        return res.json({ message: 'Group updated' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not update group' })
    }
})

router.delete('/:id', readToken, checkKind(['faculty', 'administrator']), async (req, res) => {
    const { id } = req.params

    try {
        const group = await Group.findById(id)
        if (group) {
            await Group.deleteOne({ _id: id })
        }
        return res.json({ message: 'Group deleted' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not delete group' })
    }
})

module.exports = (app) => {
    app.use('/group', router)
}
