const express = require('express')
const readToken = require('../middleware/token')
const { checkRole } = require('../middleware/role')
const Assignment = require('../models/assignment')
const Group = require('../models/group')
const Submission = require('../models/submission')
const isInRole = require('../utility/isInRole')

const router = express.Router()

/**
 * Get all assignments
 */
router.get('/', readToken, async (req, res) => {
    const { all } = req.query
    try {
        const filter = all === '1' ? {} : { published: true }
        const assignments = await Assignment.find(filter)
        return res.json(assignments)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get assignments' })
    }
})

/**
 * Get all advisory groups with submissions
 */
router.get('/adviser', readToken, async (req, res) => {
    try {
        const assignments = await Assignment.find({})
        return res.json(assignments)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get assignments' })
    }
})

/**
 * Get all groups that have submitted the specified assignment
 */
router.get('/:id/groups', readToken, checkRole(['administrator', 'faculty']), async (req, res) => {
    const { id } = req.params
    const { filter } = req.query
    const account = req.token.account
    
    try {
        const submissions = await Submission.find({ assignment: id }).distinct('group').populate('group')
        let groups = submissions.map(e => e.group)
        let canViewAll = isInRole(req.token, ['administrator', 'faculty.coordinator', 'faculty.panelist'])
        let advisoryFilter = false

        if (filter === 'adviser' && isInRole(req.token, 'faculty.adviser')) {
            groups = groups.filter(e => e.advisers.some(e2 => e2 === account))
            advisoryFilter = true
        }

        if (!canViewAll && !advisoryFilter) {
            return res.status(403).json({
                message: 'Cannot view all submissions by all groups'
            })
        }
        
        return res.json(groups)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get assignment' })
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
