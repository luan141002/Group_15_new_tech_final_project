const express = require('express')
const readToken = require('../middleware/token')
const { checkKind, checkRole } = require('../middleware/role')
const Group = require('../models/group')
const Schedule = require('../models/schedule')

const router = express.Router()

const timeToNumber = (time) => {
    const [hs, ms] = time.split(':')
    const hour = Number.parseInt(hs)
    const minute = Number.parseInt(ms)
    return hour * 100 + minute
}

const numberToTime = (number) => {
    const hour = Math.floor(number / 100)
    const minute = Math.floor(number % 100)
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

router.get('/', readToken, async (req, res) => {
    const { all } = req.query
    const author = req.token.account

    try {
        const groups = await Group.find({ $or: [ { members: author }, { advisers: author } ] })
        const query = {
            $or: [
                { type: 'personal', author },
                { type: 'global' },
                { type: 'defense' }
            ]
        }

        const schedules = await Schedule.find(query)
        return res.json(schedules.map(e => ({
            name: e.name,
            description: e.description,
            type: e.type,
            repeating: e.repeating,
            repeat: e.repeat,
            startPeriod: e.period.from,
            endPeriod: e.period.to,
            startTime: numberToTime(e.time.from),
            endTime: numberToTime(e.time.to)
        })))
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get schedules' })
    }
})

router.post('/global', readToken, checkKind(['administrator', 'faculty']), async (req, res) => {
    const { name, description, startPeriod, endPeriod, startTime, endTime, repeat } = req.body
    const author = req.token.account

    try {
        const schedule = await Schedule.create({
            name, description, author,
            type: 'global',
            period: {
                from: startPeriod,
                to: endPeriod
            },
            repeating: !!repeat,
            repeat,
            time: {
                from: timeToNumber(startTime),
                to: timeToNumber(endTime)
            }
        })
        return res.json(schedule)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get schedules' })
    }
})

router.post('/personal', readToken, async (req, res) => {
    const { name, description, startPeriod, endPeriod, startTime, endTime, repeat } = req.body
    const author = req.token.account

    try {
        const schedule = await Schedule.create({
            name, description, author,
            type: 'personal',
            period: {
                from: startPeriod,
                to: endPeriod
            },
            repeating: !!repeat,
            repeat,
            time: {
                from: timeToNumber(startTime),
                to: timeToNumber(endTime)
            }
        })
        return res.json(schedule)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get schedules' })
    }
})

router.post('/generate', readToken, checkRole(['faculty.coordinator', 'administrator']), async (req, res) => {
    return res.status(500).json({ message: 'Not implemented' })
})

module.exports = (app) => {
    app.use('/schedule', router)
}
