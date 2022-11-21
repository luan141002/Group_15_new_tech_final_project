const express = require('express')
const readToken = require('../middleware/token')
const { checkRole } = require('../middleware/role')
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

const dateToString = (date) => {
    if (date instanceof Date) {
        const offset = date.getTimezoneOffset()
        date = new Date(date.getTime() - (offset*60*1000))
        return date.toISOString().split('T')[0]
    }

    return date
}

const scheduleToJson = (schedule) => {
    return {
        id: schedule._id,
        name: schedule.name,
        description: schedule.description,
        type: schedule.type,
        repeating: schedule.repeating,
        repeat: schedule.repeat,
        startPeriod: dateToString(schedule.period.from),
        endPeriod: schedule.period.to && dateToString(schedule.period.to),
        startTime: numberToTime(schedule.time.from),
        endTime: numberToTime(schedule.time.to)
    }
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
        return res.json(schedules.map(scheduleToJson))
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get schedules' })
    }
})

router.post('/global', readToken, checkRole(['administrator', 'faculty']), async (req, res) => {
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
        return res.json(scheduleToJson(schedule))
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
        return res.json(scheduleToJson(schedule))
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get schedules' })
    }
})

router.post('/:id', readToken, async (req, res) => {
    const { id } = req.params
    const { name, description, startPeriod, endPeriod, startTime, endTime, repeat } = req.body
    const author = req.token.account

    try {
        const schedule = await Schedule.findOne({ _id: id, author })
        if (schedule) {
            schedule.name = name
            schedule.description = description
            schedule.time = {
                from: timeToNumber(startTime),
                to: timeToNumber(endTime)
            }
            if (repeat) {
                schedule.repeating = true
                schedule.repeat = repeat
                schedule.period = {
                    from: startPeriod,
                    to: endPeriod
                }
            } else {
                schedule.repeating = false
                schedule.repeat = ''
                schedule.period = {
                    from: startPeriod
                }
            }

            await schedule.save()
            return res.json({
                message: 'Schedule updated.'
            })
        } else {
            return res.status(404).json({ message: 'Schedule not found' })
        }
        
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get schedules' })
    }
})

router.delete('/:id', readToken, async (req, res) => {
    const { id } = req.params
    const author = req.token.account

    try {
        const schedule = await Schedule.findOne({ _id: id, author })
        if (schedule) {
            await Schedule.deleteOne({ _id: id })
            return res.json({
                message: 'Schedule deleted.'
            })
        } else {
            return res.status(404).json({ message: 'Schedule not found' })
        }
        
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
