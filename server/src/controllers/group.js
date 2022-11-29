const express = require('express')
const Account = require('../models/account')
const readToken = require('../middleware/token')
const { checkRole } = require('../middleware/role')
const Group = require('../models/group')
const isInRole = require('../utility/isInRole')

const router = express.Router()

router.get('/my', readToken, checkRole(['faculty.adviser', 'student']), async (req, res) => {
    const { account } = req.token
    try {
        const groups = await Group.find({
            $or: [ { members: account }, { advisers: account }, { panelists: account } ] 
        }).populate([ 'members', 'advisers', 'panelists' ])

        const mappedGroups = groups.map(group => ({
            id: group._id,
            name: group.name,
            members: group.members.map(e => Account.User.getBasicInfo(e)),
            advisers: group.advisers.map(e => Account.User.getBasicInfo(e)),
            panelists: group.panelists.map(e => Account.User.getBasicInfo(e)),
            grades: group.grades
        }))

        if (mappedGroups.length < 1) return res.json([])
        return res.json(isInRole(req.token, 'student') ? mappedGroups[0] : mappedGroups)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get groups for user' })
    }
})

router.get('/all', readToken, async (req, res) => {
    try {
        //const filter = isInRole(req.token, 'student') ? { members: req.token.account } : {}
        const filter = {}
        const groups = await Group.find(filter)
        return res.json(groups.map(group => ({
            id: group._id,
            name: group.name,
            members: group.members,
            advisers: group.advisers,
            panelists: group.panelists,
            grades: group.grades
        })))
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get groups' })
    }
})

router.post('/create', readToken, checkRole(['faculty', 'administrator']), async (req, res) => {
    const { name, advisers, members, panelists } = req.body

    try {
        const group = await Group.create({ name, advisers, members, panelists })
        return res.json({
            message: 'Group created',
            group: {
                id: group._id
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
        const filter = canSeeEveryone ? { _id: id } : { _id: id, $or: [ { members: account }, { advisers: account }, { panelists: account } ] }
        const groupInfo = await Group.findOne(filter).populate([ 'members', 'advisers', 'panelists' ])
        if (groupInfo) {
            return res.json({
                id: groupInfo._id,
                name: groupInfo.name,
                members: groupInfo.members.map(e => Account.User.getBasicInfo(e)),
                advisers: groupInfo.advisers.map(e => Account.User.getBasicInfo(e)),
                panelists: groupInfo.panelists.map(e => Account.User.getBasicInfo(e)),
                grades: groupInfo.grades
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
    const { name, advisers, members, panelists } = req.body

    try {
        const group = await Group.findById(id)
        group.name = name
        group.advisers = advisers
        group.members = members
        group.panelists = panelists
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
