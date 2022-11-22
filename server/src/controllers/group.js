const express = require('express')
const { User } = require('../models/account')
const Account = require('../models/account')
const crypto = require('crypto')
const Token = require('../models/token')
const readToken = require('../middleware/token')
const { checkRole } = require('../middleware/role')
const { generateName } = require('../utility/name')
const Group = require('../models/group')
const isInRole = require('../utility/isInRole')

const router = express.Router()

router.get('/my', readToken, checkRole(['faculty.adviser', 'student']), async (req, res) => {
    const { account } = req.token
    try {
        const groups = await Group.find({ $or: [ { members: account }, { advisers: account } ] }).populate([ 'members', 'advisers' ])
        return res.json(groups)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get groups for user' })
    }
})

router.get('/all', readToken, checkRole(['faculty', 'administrator']), async (req, res) => {
    try {
        const groups = await Group.find()
        return res.json(groups)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get groups' })
    }
})

router.post('/create', readToken, checkRole(['faculty', 'administrator']), async (req, res) => {
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

router.get('/:id', readToken, async (req, res) => {
    const { account } = req.token
    const { id } = req.params
    try {
        const canSeeEveryone = isInRole(req.token, ['administrator', 'faculty.coordinator', 'faculty.panelist'])
        const filter = canSeeEveryone ? { _id: id } : { _id: id, $or: [ { members: account }, { advisers: account } ] }
        const groupInfo = await Group.findOne(filter).populate([ 'members', 'advisers' ])
        if (groupInfo) {
            return res.json({
                name: groupInfo.name,
                members: groupInfo.members.map(e => Account.User.getBasicInfo(e)),
                advisers: groupInfo.advisers.map(e => Account.User.getBasicInfo(e))
            })
        } else {
            return res.status(404).json({
                message: 'Group not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get group' })
    }
})

router.post('/:id', readToken, checkRole(['faculty', 'administrator']), async (req, res) => {
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

router.delete('/:id', readToken, checkRole(['faculty', 'administrator']), async (req, res) => {
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
