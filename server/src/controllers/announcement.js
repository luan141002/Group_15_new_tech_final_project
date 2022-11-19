const express = require('express')
const readToken = require('../middleware/token')
const { checkKind } = require('../middleware/role')
const Announcement = require('../models/announcement')

const router = express.Router()

router.get('/', readToken, async (req, res) => {
    const { since } = req.query
    const sinceObj = new Date(since)

    try {
        const announcements = await Announcement.find({ uploadDate: { $gt: sinceObj } })
        return res.json(announcements)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get announcements' })
    }
})

router.get('/all', readToken, async (req, res) => {
    try {
        const announcements = await Announcement.find()
        return res.json(announcements)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get announcements' })
    }
})

router.post('/', readToken, checkKind(['faculty.coordinator', 'administrator']), async (req, res) => {
    const { title, message } = req.body
    const author = req.token.account
    try {
        const announcement = await Announcement.create({ title, message, author })
        return res.json({
            message: 'Announcement created',
            announcement
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not post announcement' })
    }
})

router.post('/:id', readToken, checkKind(['faculty.coordinator', 'administrator']), async (req, res) => {
    const { id } = req.params
    const { title, message } = req.body
    const author = req.token.account

    try {
        const announcement = await Announcement.findById(id)
        if (announcement) {
            if (announcement.author === author) {
                author.title = title
                author.message = message
                await announcement.save()

                return res.json({ message: 'Announcement updated' })
            } else {
                return res.status(401).json({
                    message: 'You are not the author of the announcement'
                })
            }
        } else {
            return res.status(404).json({
                message: 'Announcement not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not update announcement' })
    }
})

router.delete('/:id', readToken, checkKind(['faculty.coordinator', 'administrator']), async (req, res) => {
    const { id } = req.params
    const author = req.token.account

    try {
        const announcement = await Announcement.findById(id)
        if (announcement) {
            if (announcement.author === author) {
                await Announcement.deleteOne({ _id: id })
                return res.json({ message: 'Announcement deleted' })
            } else {
                return res.status(401).json({
                    message: 'You are not the author of the announcement'
                })
            }
        } else {
            return res.status(404).json({
                message: 'Announcement not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not delete announcement' })
    }
})

module.exports = (app) => {
    app.use('/announcement', router)
}
