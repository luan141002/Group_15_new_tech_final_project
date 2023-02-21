const EmailTemplate = require('../models/EmailTemplate');
const escape = require('escape-html');
const nodemailer = require('nodemailer');

async function getTemplate(name) {
    const value = await EmailTemplate.findById(name).lean()
    return value
}

function substituteVariables(input, variables, transformer) {
    const regex = /\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}/g
    let original = input
    let string = input
    let match = null
    let delta = 0
    while ((match = regex.exec(original)) !== null) {
        const startIndex = match.index + delta
        const length = match[0].length
        const variable = match[1]
        const rawValue = variables[variable] || ''
        const value = transformer ? transformer(rawValue) : rawValue

        string = string.substring(0, startIndex) + variables[variable] + string.substring(startIndex + length)
        delta += value.length - length
    }

    return string
}

async function generateMailFromTemplate(name, variables) {
    const template = await getTemplate(name)
    return {
        subject: substituteVariables(template.subject, variables),
        html: substituteVariables(template.body, variables, escape)        
    }
}

async function sendMail(mailData) {
    const { to, subject, body, calendar } = mailData
    const { template, variables } = mailData
    const from = process.env.MAIL_SMTP_FROM || process.env.MAIL_SMTP_USER

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_SMTP_HOST,
        port: Number.parseInt(process.env.MAIL_SMTP_PORT),
        auth: {
            user: process.env.MAIL_SMTP_USER,
            pass: process.env.MAIL_SMTP_PASS
        }
    })

    const mail = template ? await generateMailFromTemplate(template, variables) : {
        subject, html: body
    }

    mail.to = to
    mail.from = from

    /*if (calendar) {
        const cal = new ical.ICalCalendar()
        const start = new Date(calendar.start || Date.now())
        const end = new Date(calendar.end || (start.getTime() + calendar.duration * 1000))
        cal.createEvent({
            summary: 'Meeting',
            description: 'Meeting for the group',
            location: 'online',
            start: start,
            end: end
        })
        const icalRaw = cal.toString()
        mail.icalEvent = {
            method: 'request',
            filename: 'invitation.ics',
            content: icalRaw
        }
    }*/

    await transporter.sendMail(mail)
}

module.exports = {
    sendMail
};
