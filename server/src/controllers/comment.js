const express = require('express')
const readToken = require('../middleware/token')
const Comment = require('../models/comment')

const router = express.Router()

router.get('/:sid', readToken, async (req, res) => {
    const { sid } = req.params

    try {
        const comments = await Comment.find({ submission: sid, document: null }).populate('author').sort({ date: 'desc' })
        return res.json(comments.map(e => ({
            id: e._id,
            text: e.text,
            date: e.date,
            submission: e.submission,
            author: {
                id: e.author._id,
                idnum: e.author.idnum,
                lastName: e.author.lastName,
                firstName: e.author.firstName,
                middleName: e.author.middleName,
                email: e.author.email
            }
        })))
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get comments' })
    }
})

router.post('/:sid', readToken, async (req, res) => {
    const { sid } = req.params
    const { text } = req.body
    const author = req.token.account

    try {
        const comment = await Comment.create({
            submission: sid,
            author,
            text
        })

        return res.json({
            message: 'Comment posted',
            comment: {
                id: comment._id,
                submission: sid,
                author,
                text
            }
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not post comment' })
    }
})

router.delete('/:sid/comment/:cid', readToken, async (req, res) => {
    const { sid, cid } = req.params
    const author = req.token.account

    try {
        const filter = { _id: cid, submission: sid, document: null, author }
        const comment = await Comment.findOne(filter)
        if (comment) {
            await Comment.deleteOne(filter)
            return res.json({ message: 'Comment deleted' })
        } else {
            return res.status(404).json({
                message: 'Comment not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not delete comment' })
    }
})

router.get('/:sid/document/:did', readToken, async (req, res) => {
    const { sid, did } = req.params

    try {
        const comments = await Comment.find({ submission: sid, document: did }).populate('author').sort({ date: 'desc' })
        return res.json(comments.map(e => ({
            id: e._id,
            text: e.text,
            date: e.date,
            submission: e.submission,
            document: e.document,
            author: {
                id: e.author._id,
                idnum: e.author.idnum,
                lastName: e.author.lastName,
                firstName: e.author.firstName,
                middleName: e.author.middleName,
                email: e.author.email
            }
        })))
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get comments' })
    }
})

router.post('/:sid/document/:did', readToken, async (req, res) => {
    const { sid, did } = req.params
    const { text } = req.body
    const author = req.token.account

    try {
        const comment = await Comment.create({
            submission: sid,
            document: did,
            author,
            text
        })
        return res.json({
            message: 'Comment posted',
            comment: {
                id: comment._id,
                submission: sid,
                author,
                text
            }
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not post comment' })
    }
})

router.delete('/:sid/document/:did/comment/:cid', readToken, async (req, res) => {
    const { sid, did, cid } = req.params
    const author = req.token.account

    try {
        const filter = { _id: cid, submission: sid, document: did, author }
        const comment = await Comment.findOne(filter)
        if (comment) {
            await Comment.deleteOne(filter)
            return res.json({ message: 'Comment deleted' })
        } else {
            return res.status(404).json({
                message: 'Comment not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not delete comment' })
    }
})

module.exports = (app) => {
    app.use('/comment', router)
}
