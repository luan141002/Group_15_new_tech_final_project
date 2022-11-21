const Accounts = require('../models/account')
const crypto = require('crypto')

function generateVerifyToken(text) {
    const hasher = crypto.createHash('sha256')
    hasher.update(text)
    hasher.update(Date.now().toString())
    return hasher.digest('base64')
}

module.exports.initialize = async function() {
    const admin = await Accounts.Administrator.findOne({ username: 'admin' })
    if (!admin) {
        const superad = await Accounts.Administrator.create({
            idnum: '1',
            username: 'admin',
            lastName: 'Admin',
            firstName: 'Admin',
            email: 'admin@example.com',
            passwordEnc: 'thesis!',
            superadmin: true,
            startDate: new Date(0),
            endDate: new Date(10000 * 365 * 86400 * 1000),
            verified: true,
            verifyCode: '0'
        })

        const chair = await Accounts.Administrator.create({
            idnum: '20220001',
            username: 'chair',
            lastName: 'Chair',
            firstName: 'Admin',
            email: 'chair@example.com',
            passwordEnc: 'p@ssword',
            startDate: new Date(0),
            endDate: new Date(10000 * 365 * 86400 * 1000),
            roles: ['chair'],
            verified: true,
            verifyCode: '0'
        })
        
        const secretary = await Accounts.Administrator.create({
            idnum: '20220002',
            username: 'secretary',
            lastName: 'Secretary',
            firstName: 'Admin',
            email: 'secretary@example.com',
            passwordEnc: 'p@ssword',
            startDate: new Date(0),
            endDate: new Date(10000 * 365 * 86400 * 1000),
            roles: ['secretary'],
            verified: true,
            verifyCode: '0'
        })

        const johnDoe = await Accounts.Faculty.create({
            idnum: '20220011',
            username: 'john.doe',
            lastName: 'Doe',
            firstName: 'John',
            email: 'john.doe@example.com',
            passwordEnc: 'p@ssword',
            startDate: new Date(0),
            endDate: new Date(10000 * 365 * 86400 * 1000),
            roles: ['adviser', 'panelist', 'coordinator'],
            verified: true,
            verifyCode: '0'
        })

        const janeDoe = await Accounts.Faculty.create({
            idnum: '20220012',
            username: 'jane.doe',
            lastName: 'Doe',
            firstName: 'Jane',
            email: 'jane.doe@example.com',
            passwordEnc: 'p@ssword',
            startDate: new Date(0),
            endDate: new Date(10000 * 365 * 86400 * 1000),
            roles: ['adviser', 'panelist'],
            verified: true,
            verifyCode: '0'
        })

        const johnSmith = await Accounts.Faculty.create({
            idnum: '20220013',
            username: 'john.smith',
            lastName: 'Smith',
            firstName: 'John',
            email: 'john.smith@example.com',
            passwordEnc: 'p@ssword',
            startDate: new Date(0),
            endDate: new Date(10000 * 365 * 86400 * 1000),
            roles: ['adviser', 'panelist'],
            verified: true,
            verifyCode: '0'
        })

        const janeSmith = await Accounts.Faculty.create({
            idnum: '20220014',
            username: 'jane.smith',
            lastName: 'Smith',
            firstName: 'Jane',
            email: 'jane.smith@example.com',
            passwordEnc: 'p@ssword',
            startDate: new Date(0),
            endDate: new Date(10000 * 365 * 86400 * 1000),
            roles: ['adviser', 'panelist'],
            verified: true,
            verifyCode: '0'
        })

        const students = [
            { idnum: '11900001', username: 'student1', lastName: 'Graham', firstName: 'Leanne' },
            { idnum: '11900002', username: 'student2', lastName: 'Howell', firstName: 'Ervin' },
            { idnum: '11900003', username: 'student3', lastName: 'Bauch', firstName: 'Clementine' },
            { idnum: '11900004', username: 'student4', lastName: 'Lebsack', firstName: 'Patricia ' },
            { idnum: '11900005', username: 'student5', lastName: 'Dietrich', firstName: 'Chelsey' },
            { idnum: '11900006', username: 'student6', lastName: 'Schulist', firstName: 'Dennis' },
            { idnum: '11900007', username: 'student7', lastName: 'Weissnat', firstName: 'Kurtis' },
            { idnum: '11900008', username: 'student8', lastName: 'Runolfsdottir', firstName: 'Nicholas V' },
            { idnum: '11900009', username: 'student9', lastName: 'Reichert', firstName: 'Glenna' },
            { idnum: '11900010', username: 'student0', lastName: 'DuBuque', firstName: 'Clementina' },
        ]

        const studentObjs = await Promise.all(students.map(e => {
            const username = e.username
            const verifyCode = generateVerifyToken(username)
            return Accounts.Student.create({
                idnum: e.idnum,
                username: username,
                lastName: e.lastName,
                firstName: e.firstName,
                email: `${e.username}@example.com`,
                passwordEnc: 'p@ssword',
                startDate: new Date(2022, 8, 5),
                endDate: new Date(2022, 11, 18),
                verified: false,
                verifyCode
            })
        }))
    }
}
