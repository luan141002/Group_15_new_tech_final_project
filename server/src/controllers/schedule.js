const express = require('express')
const readToken = require('../middleware/token')
const { checkRole } = require('../middleware/role')
const Group = require('../models/group')
const Schedule = require('../models/schedule')
const Account = require('../models/account')
const { unique, uniq, clone, cloneDeep } = require('lodash')
const { inspect } = require('util')
const dayjs = require('dayjs')
const { RRule, RRuleSet } = require('rrule')
const isInRole = require('../utility/isInRole')

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
        endTime: numberToTime(schedule.time.to),
        group: schedule.group
    }
}

router.get('/', readToken, async (req, res) => {
    const { all } = req.query
    const author = req.token.account

    try {
        let schedules = []
        if (isInRole(req.token, ['administrator', 'faculty.coordinator'])) {
            const query = {
                $or: [
                    { type: 'personal', author },
                    { type: 'global' },
                    { type: 'defense' }
                ]
            }
    
            schedules = await Schedule.find(query)
        } else {
            const groups = await Group.find({ $or: [ { members: author }, { advisers: author }, { panelists: author } ] })
            const query = {
                $or: [
                    { type: 'personal', author },
                    { type: 'global' },
                    { type: 'defense', group: { $in: groups.map(e => e._id.toString()) } }
                ]
            }
    
            schedules = await Schedule.find(query)
        }

        return res.json(schedules.map(scheduleToJson))
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not get schedules' })
    }
})

router.get('/defense', readToken, async (req, res) => {
    try {
        const defenses = await Schedule.find({ type: 'defense' })
        return res.json(defenses.map(scheduleToJson))
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

// Code cannot handle different time zones right now.
function parseDate(date, time) {
    const hour = Math.floor(time / 100)
    const minute = Math.floor(time % 100)
    if (!(date instanceof Date)) date = new Date(date)
    const dateObj = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hour, minute)
    return dateObj
}

function getDatePart(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function nextDay(date) {
    return new Date(date.getTime() + 86400 * 1000)
}

function datesIntersect(s1, e1, s2, e2) {
    const s1t = s1.getTime()
    const e1t = e1.getTime()
    const s2t = s2.getTime()
    const e2t = e2.getTime()
    
    return s1t < e2t && e1t > s2t
}

const repeats = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA]

function generateRepeatedScheduleWithinRange(schedule, rangeStart, rangeEnd) {
    const repeat = schedule.repeat
    const startRule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: repeat.split('').map(e => repeats[Number.parseInt(e)]),
        dtstart: parseDate(schedule.startPeriod, schedule.startTime),
        until: parseDate(schedule.endPeriod, 2359)
    })
    const endRule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: repeat.split('').map(e => repeats[Number.parseInt(e)]),
        dtstart: parseDate(schedule.startPeriod, schedule.endTime),
        until: parseDate(schedule.endPeriod, 2359)
    })
    const startEntries = startRule.between(getDatePart(rangeStart), nextDay(getDatePart(rangeEnd)))
    const endEntries = endRule.between(getDatePart(rangeStart), nextDay(getDatePart(rangeEnd)))
    
    const dates = startEntries.map((entry, i) => ({ start: entry, end: endEntries[i] }))
    return dates
}

/**
 * 
 * @param {{start: Date, end: Date}} period 
 * @param {*} schedule 
 * @returns 
 */
function scheduleConflictsWithPeriod(period, schedule) {
    if (schedule.repeating) {
        const rangeStart = parseDate(schedule.startPeriod, 0)
        const rangeEnd = parseDate(schedule.endPeriod, 2359)
        if (!datesIntersect(period.start, period.end, rangeStart, rangeEnd)) return false

        const schedules = generateRepeatedScheduleWithinRange(schedule, period.start, period.end)
        const conflicts = schedules.some(e => datesIntersect(e.start, e.end, period.start, period.end))
        return conflicts
    } else {
        const start = parseDate(schedule.startPeriod, schedule.startTime)
        const end = parseDate(schedule.startPeriod, schedule.endTime)
        const conflicts =  datesIntersect(period.start, period.end, start, end)
        return conflicts
    }
}

function generateRandomSchedule(groups, freeSlotsInfo, attempts) {
    if (attempts === undefined || attempts === null) return generateRandomSchedule(groups, freeSlotsInfo, 1)
    if (attempts < 1) return null

    const takenSchedules = {}
    const groupsSchedules = groups.map(({ id, name }) => ({
        id,
        name,
        availableSlots: freeSlotsInfo.filter(({ free }) => free.includes(id)).map(e => ({
            id: e.id,
            start: e.start,
            end: e.end
        }))
    }))

    const tentativeSchedule = []

    groupsSchedules.sort((a, b) => b.availableSlots.length - a.availableSlots.length)
    while (groupsSchedules.length > 0) {
        const groupInfo = groupsSchedules.pop()
        const { id, name, availableSlots } = groupInfo
        if (availableSlots.every(e => !!takenSchedules[e.id])) {
            break // One group could not be assigned a schedule
        }

        let slotIndex = -1
        let slot = null
        do {
            slotIndex = Math.floor(availableSlots.length * Math.random())
            slot = availableSlots[slotIndex]
        } while (!!takenSchedules[slot.id])

        takenSchedules[slot.id] = true
        tentativeSchedule.push({
            id: slot.id,
            group: id,
            title: name,
            start: slot.start,
            end: slot.end
        })
    }

    if (groupsSchedules.length === 0) {
        tentativeSchedule.sort(e => e.start.getTime() - e.end.getTime())
        return tentativeSchedule
    }
    
    return generateRandomSchedule(groups, freeSlotsInfo, attempts - 1)
}

// schema
// { ignoredAccountSchedules: [ <accountId> ], defenseSlots: [{start, end}] }
router.post('/generate', readToken, checkRole('faculty.coordinator'), async (req, res) => {
    const options = req.body || {}

    try {
        // Step 1: Get parameters
        const ignoredAccounts = options.ignoredAccounts || []
        const defenseSlots = (options.defenseSlots || []).map(e => ({
            start: new Date(e.start),
            end: new Date(e.end)
        }))

        // Step 2: Prepare data
        // 2a. Get all active groups
        const groups = await Group.find({ active: true })
        // 2b. Get all members of each group
        const groupMemberIDs = groups.map(e => e.members.map(e2 => e2.toString()))
        const memberIDs = uniq(groupMemberIDs.flat())

        // 2c. Get all panelists
        const panelists = await Account.Faculty.find({ roles: 'panelist' })
        const panelistIDs = panelists.map(e => e._id.toString())
        
        // 2d. Combine all involved people into a single list
        const allIDs = uniq([...memberIDs, ...panelistIDs]).filter(e => !ignoredAccounts.includes(e))

        const globalSchedules = await Schedule.find({ type: 'global' })
        const personalSchedules = await Schedule.find({ type: 'personal', author: { $in: allIDs } })
        
        const getSchedules = account => ({
            id: account.toString(),
            schedule: personalSchedules.filter(sched => sched.author.toString() === account.toString()).map(sched => ({
                id: sched._id.toString(),
                startPeriod: sched.period.from,
                endPeriod: sched.period.to,
                startTime: sched.time.from,
                endTime: sched.time.to,
                repeating: sched.repeating,
                repeat: sched.repeat
            }))
        })

        const groupSchedules = groups.map(group => {
            return {
                id: group._id.toString(),
                schedules: [...group.members.map(getSchedules), ...group.panelists.map(getSchedules)]
            }
        })

        const freeSlotsInfo = defenseSlots.map((slot, i) => {
            return {
                id: i,
                start: slot.start,
                end: slot.end,
                free: groupSchedules.filter(group => {
                    return group.schedules.every(({ id, schedule }) => {
                        return schedule.every(entry => !scheduleConflictsWithPeriod({ start: slot.start, end: slot.end }, entry))
                    })
                }).map(group => group.id)
            }
        }).filter(e => e.free.length > 0)

        const randomSchedule = generateRandomSchedule(groups.map(e => ({ id: e._id.toString(), name: e.name })), freeSlotsInfo, 10)

        return res.json({
            freeSlotsInfo,
            tentativeSchedule: randomSchedule
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not generate defense schedule' })
    }
})

router.post('/applysched', readToken, checkRole('faculty.coordinator'), async (req, res) => {
    const schedule = req.body
    const author = req.token.account

    // format: [{ date: "YYYY-MM-DD", start: "HH:MM", end: "HH:MM", group: id }]
    try {
        const groupIDsToReserve = schedule.map(e => e.group)
        const groupsToReserve = await Group.find({ _id: { $in: groupIDsToReserve }})
        
        await Schedule.insertMany(schedule.map(e => ({
            name: 'Defense',
            type: 'defense',
            author,
            group: e.group,
            period: { from: e.date },
            time: {
                from: timeToNumber(e.start),
                to: timeToNumber(e.end)
            }
        })))

        return res.json({
            message: 'Defense schedule applied'
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Could not apply defense schedule' })
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

module.exports = (app) => {
    app.use('/schedule', router)
}
