const Account = require('../models/Account');

module.exports.initialize = async function() {
    const admin = await Account.Administrator.findOne({ idnum: 'admin' });
    if (!admin) {
        const superad = await Account.Administrator.create({
            idnum: 'admin',
            lastName: 'Admin',
            firstName: 'Admin',
            email: 'admin@example.com',
            password: 'thesis!',
            activated: true,
        });

        if (process.env.NODE_ENV.trim() !== 'development') return;

        const users = [
            {
                idnum: '20220001',
                lastName: 'Chair',
                firstName: 'Admin',
                email: 'chair@example.com',
                type: 'Administrator',
            },
            {
                idnum: '20220002',
                lastName: 'Secretary',
                firstName: 'Admin',
                email: 'secretary@example.com',
                type: 'Administrator',
            },
            {
                idnum: '20220011',
                lastName: 'Doe',
                firstName: 'John',
                email: 'john.doe@example.com',
                type: 'Faculty',
            },
            {
                idnum: '20220012',
                lastName: 'Doe',
                firstName: 'Jane',
                email: 'jane.doe@example.com',
                type: 'Faculty',
            },
            {
                idnum: '20220013',
                lastName: 'Smith',
                firstName: 'John',
                email: 'john.smith@example.com',
                type: 'Faculty',
            },
            {
                idnum: '20220014',
                lastName: 'Smith',
                firstName: 'Jane',
                email: 'jane.smith@example.com',
                type: 'Faculty',
            },
            { idnum: '11900001', lastName: 'Graham', firstName: 'Leanne', email: 'student1@example.com' },
            { idnum: '11900002', lastName: 'Howell', firstName: 'Ervin', email: 'student2@example.com' },
            { idnum: '11900003', lastName: 'Bauch', firstName: 'Clementine', email: 'student3@example.com' },
            { idnum: '11900004', lastName: 'Lebsack', firstName: 'Patricia', email: 'student4@example.com' },
            { idnum: '11900005', lastName: 'Dietrich', firstName: 'Chelsey', email: 'student5@example.com' },
            { idnum: '11900006', lastName: 'Schulist', firstName: 'Dennis', email: 'student6@example.com' },
            { idnum: '11900007', lastName: 'Weissnat', firstName: 'Kurtis', email: 'student7@example.com' },
            { idnum: '11900008', lastName: 'Runolfsson', firstName: 'Nicholas V', email: 'student8@example.com' },
            { idnum: '11900009', lastName: 'Reichert', firstName: 'Glenna', email: 'student9@example.com' },
            { idnum: '11900010', lastName: 'DuBuque', firstName: 'Clementina', email: 'student10@example.com' },
        ];

        const userObjs = await Promise.all(users.map(e => {
            let schema = Account.Student;
            if (e.type === 'Administrator') schema = Account.Administrator;
            if (e.type === 'Faculty') schema = Account.Faculty;

            return schema.create({
                idnum: e.idnum,
                lastName: e.lastName,
                firstName: e.firstName,
                email: e.email
            });
        }));
    }
}
