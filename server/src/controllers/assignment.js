const express = require('express')
const readToken = require('../middleware/token')
const { checkRole } = require('../middleware/role')
const Assignment = require('../models/assignment')

const router = express.Router()

router.get('/', readToken, async (req, res) => {
    try {
        const assignments = await Assignment.find({})
        return res.json(assignments)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get assignments' })
    }
})

router.get('/:id', readToken, async (req, res) => {
    const { id } = req.params
    try {
        const assignment = await Assignment.findById(id)
        return res.json(assignment)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get assignment' })
    }
})

router.post('/', readToken, checkRole(['faculty.coordinator', 'administrator']), async (req, res) => {
    const { name, description, due } = req.body
    const author = req.token.account
    try {
        const assignment = await Assignment.create({ name, description, due, author })
        return res.json({
            message: 'Assignment created',
            assignment
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not create assignment' })
    }
})

router.post('/:id/publish', readToken, checkRole(['faculty.coordinator', 'administrator']), async (req, res) => {
    const author = req.token.account
    const { id } = req.params
    try {
        const assignment = await Assignment.findOne({ _id: id, author })
        if (assignment) {
            assignment.published = true
            await assignment.save()
            return res.json({ message: 'Assignment published' })
        } else {
            return res.status(404).json({
                message: 'Assignment not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not publish assignment' })
    }
})

router.post('/:id', readToken, checkRole(['faculty.coordinator', 'administrator']), async (req, res) => {
    const { id } = req.params
    const { name, description, due } = req.body
    const author = req.token.account

    try {
        const assignment = await Assignment.findOne({ _id: id, author })
        if (assignment) {
            assignment.name = name
            assignment.description = description
            assignment.due = due
            await assignment.save()

            return res.json({ message: 'Assignment updated' })
        } else {
            return res.status(404).json({
                message: 'Assignment not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not update assignment' })
    }
})

router.delete('/:id', readToken, checkRole(['faculty.coordinator', 'administrator']), async (req, res) => {
    const { id } = req.params
    const author = req.token.account

    try {
        const assignment = await Assignment.findOne({ _id: id, author })
        if (assignment) {
            if (!assignment.published) {
                await Assignment.deleteOne({ _id: id })
                return res.json({ message: 'Assignment deleted' })
            } else {
                return res.status(400).json({ message: 'Cannot delete published assignment' })
            }
        } else {
            return res.status(404).json({
                message: 'Assignment not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not delete assignment' })
    }
})

module.exports = (app) => {
    app.use('/assignment', router)
}
