const express = require('express')
const readToken = require('../middleware/token')
const { checkRole } = require('../middleware/role')
const Process = require('../models/process')
const dayjs = require('dayjs')

const router = express.Router()

router.get('/', readToken, async (req, res) => {
    const { all } = req.query
    const now = new Date()

    try {
        let filter = { 
            'period.start': { $lt: now },
            'period.end': { $gt: new Date(now + 30 * 86400 * 1000) }
        }

        if (all === '1') {
            filter = {}
        }

        const processes = await Process.find(filter)
        return res.json(processes)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get processes' })
    }
})

router.post('/', readToken, checkRole('administrator'), async (req, res) => {
    const { id, name, description, startDate, endDate } = req.body
    const author = req.token.account
    try {
        const process = await Process.create({ id, name, description, startDate, endDate, author })
        return res.json({
            message: 'Process created',
            process
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not create process' })
    }
})

router.post('/:id', readToken, checkRole('administrator'), async (req, res) => {
    const { id } = req.params
    const { name, description, startDate, endDate } = req.body
    const author = req.token.account

    try {
        const process = await Process.findOne({ _id: id, author })
        if (process) {
            process.name = name
            process.description = description
            process.startDate = startDate
            process.endDate = endDate
            await process.save()

            return res.json({ message: 'Process updated' })
        } else {
            return res.status(404).json({
                message: 'Process not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not update process' })
    }
})

router.delete('/:id', readToken, checkRole('administrator'), async (req, res) => {
    const { id } = req.params
    const author = req.token.account

    try {
        const process = await Process.findOne({ _id: id, author })
        if (process) {
            await Process.deleteOne({ _id: id })
            return res.json({ message: 'Process deleted' })
        } else {
            return res.status(404).json({
                message: 'Process not found'
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not delete process' })
    }
})

module.exports = (app) => {
    app.use('/process', router)
}
