const express = require('express')
const readToken = require('../middleware/token')
const transacted = require('../middleware/transaction')
const { checkRole } = require('../middleware/role')
const Document = require('../models/document')
const Assignment = require('../models/assignment')
const Submission = require('../models/submission')
const Group = require('../models/group')
const ServerError = require('../error')

const multer = require('multer')

const router = express.Router()

const upload = multer({
    limits: {
        fileSize: 50 * 1024 * 1024
    }
})

// Get submissions by current group for specified assignment
router.get('/assignment/:id', readToken, checkRole('student'), async (req, res) => {
    const { id } = req.params
    const account = req.token.account
    try {
        const group = await Group.findOne({ members: account })
        if (!group) throw new ServerError(404, 'Current group not found')

        const submissions = await Submission.find({ assignment: id, group: group._id })
        return res.json(submissions)
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }

        console.log(err)
        return res.status(500).json({ message: 'Could not get submission' })
    }
})

// Get submissions by all groups for specified assignment
router.get('/assignment/:id/all', readToken, async (req, res) => {
    const { id } = req.params
    try {
        const submissions = await Submission.find({ assignment: id })
        return res.json(submissions)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get submission' })
    }
})

// Get submissions by group for specified assignment
router.get('/assignment/:id/group/:gid', readToken, async (req, res) => {
    const { id, gid } = req.params
    try {
        const submissions = await Submission.find({ assignment: id, group: gid })
        return res.json(submissions)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get submission' })
    }
})

// Upload submission for specified assignment (use student's current group)
router.post('/assignment/:id', readToken, checkRole('student'), upload.array('files', 10), async (req, res) => {
    const { id } = req.params
    const author = req.token.account
    const files = req.files

    try {
        const group = await Group.findOne({ members: author })
        if (!group) throw new ServerError(400, 'Student does not belong to any group')

        console.log(files)
        const submission = await Submission.create({
            assignment: id,
            group: group._id,
            submitter: author,
            endorsements: []
        })

        if (submission) {
            await Promise.all(files.map(file => 
                Document.create({
                    filename: file.originalname,
                    type: file.mimetype,
                    uploader: author,
                    data: file.buffer,
                    submission: submission._id,
                    processed: []
                })
            ))
        }

        return res.json({
            message: 'Submission uploaded'
        })
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }
        
        console.log(err)
        return res.status(500).json({ message: 'Could not post submission' })
    }
})

router.get('/:id', readToken, async (req, res) => {
    const { id } = req.params

    try {
        const submission = await Submission.findById(id)
        if (!submission) throw new ServerError(404, 'Submission not found')
        const documents = await Document.find({ submission: id }).select('-data')
        
        return res.json({
            info: submission,
            documents
        })
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }
        
        console.log(err)
        return res.status(500).json({ message: 'Could not get submission' })
    }
})

router.get('/:id/document/:did', readToken, async (req, res) => {
    const { id, did } = req.params

    try {
        const document = await Document.findOne({ _id: did, submission: id })
        if (!document) throw new ServerError(404, 'Document not found')
        return res.contentType(document.type).send(document.data)
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }
        
        console.log(err)
        return res.status(500).json({ message: 'Could not get document' })
    }
})

// Endorse the selected submission
router.get('/:id/documents', readToken, async (req, res) => {
    const { id } = req.params

    try {
        const documents = await Document.find({ submission: id }).populate('-data')
        return res.json(documents)
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }
        
        console.log(err)
        return res.status(500).json({ message: 'Could not get documents for submission' })
    }
})

// Endorse the selected submission
router.post('/:id/endorse', readToken, checkRole('faculty.adviser'), async (req, res) => {
    const { id } = req.params
    const account = req.token.account
    const files = req.files

    try {
        const submission = await Submission.findById(id)
        if (!submission) throw new ServerError(404, 'Submission not found')

        const group = await Group.findOne({ _id: submission.group, advisers: account })
        if (!group) throw new ServerError(400, 'Adviser does not belong to this group')

        submission.endorsements.push({ by: account })
        await submission.save()

        return res.json({
            message: 'Submission endorsed'
        })
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }
        
        console.log(err)
        return res.status(500).json({ message: 'Could not endorse submission' })
    }
})

// Approve the selected submission
router.post('/:id/approve', readToken, checkRole('faculty.coordinator'), async (req, res) => {
    const { id } = req.params
    const account = req.token.account
    const files = req.files

    try {
        const submission = await Submission.findById(id)
        if (!submission) throw new ServerError(404, 'Submission not found')

        submission.approval = { by: account }
        await submission.save()

        return res.json({
            message: 'Submission approved'
        })
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }
        
        console.log(err)
        return res.status(500).json({ message: 'Could not approve submission' })
    }
})

// Delete submission
router.delete('/:id', readToken, checkRole(['faculty.coordinator', 'administrator']), async (req, res) => {
    const { id } = req.params

    try {
        const submission = await Submission.findById(id)
        if (submission) {
            await Submission.deleteOne({ _id: id })
            return res.json({ message: 'Submission deleted' })
        } else {
            throw new ServerError(404, 'Submission not found')
        }
    } catch (err) {
        if (err instanceof ServerError) {
            return res.status(err.status).json({
                message: err.message,
                details: res.details
            })
        }

        console.log(err)
        return res.status(500).json({ message: 'Could not delete submission' })
    }
})

module.exports = (app) => {
    app.use('/submission', router)
}
