const express = require('express');
const Account = require('../models/Account');
const requireToken = require('../middleware/requireToken');
const ServerError = require('../utility/error');

const AccountController = express.Router();

AccountController.get('/account', requireToken, async (req, res) => {
    const { type, q } = req.query;
    const token = req.token;
    
    try {
        let schema = Account.User;
        switch (type) {
            case 'administrator': schema = Account.Administrator; break;
            case 'faculty': schema = Account.Faculty; break;
            case 'student': schema = Account.Student; break;
        }

        const isAdmin = token.kind.toLowerCase() === 'administrator';

        let query = {};
        if (q) {
            query.$or = [
                { lastName:  { $regex: q, $options: 'i' } },
                { firstName: { $regex: q, $options: 'i' } },
            ];
        }

        const results = await schema.find(query).sort('lastName firstName');
        return res.json(results.map(e => ({
            _id: e._id,
            idnum: isAdmin ? e.idnum : undefined,
            lastName: e.lastName,
            firstName: e.firstName,
            middleName: e.middleName,
            kind: e.kind.toLowerCase()
        })));
    } catch (error) {
        return res.error(error, 'Cannot get accounts');
    }
});

AccountController.get('/account/:id', requireToken, async (req, res) => {
    const { id } = req.params;
    const token = req.token;
    
    try {
        const isAdmin = token.kind.toLowerCase() === 'administrator';

        const result = await Account.User.findById(id);
        return res.json({
            _id: result._id,
            idnum: isAdmin ? result.idnum : undefined,
            lastName: result.lastName,
            firstName: result.firstName,
            middleName: result.middleName,
            kind: result.kind.toLowerCase(),
            email: isAdmin ? result.email : undefined,
            joined: result.joined
        });
    } catch (error) {
        return res.error(error, 'Cannot get account');
    }
});

const TYPES = ['student', 'faculty', 'administrator'];

AccountController.post('/account', async (req, res) => {
    const { idnum, email, lastName, firstName, middleName, kind } = req.body;
    const token = req.token;
    const errors = [];
    
    try {
        if (!idnum) errors.push({ fieldName: 'idnum', message: 'ID number is required' });
        if (!email) errors.push({ fieldName: 'email', message: 'Email address is required' });
        if (!lastName) errors.push({ fieldName: 'lastName', message: 'Last name is required' });
        if (!firstName) errors.push({ fieldName: 'firstName', message: 'First name is required' });
        if (!TYPES.includes(kind)) errors.push({ fieldName: 'kind', message: 'Invalid account type' });
        if (errors.length > 0) throw new ServerError(400, 'Form error', errors);

        let schema = Account.User;
        switch (kind) {
            case 'administrator': schema = Account.Administrator; break;
            case 'faculty': schema = Account.Faculty; break;
            case 'student': schema = Account.Student; break;
        }

        const isAdmin = token.kind.toLowerCase() === 'administrator';

        const result = await schema.create({
            idnum,
            email,
            lastName,
            firstName,
            middleName
        });

        return res.status(201).location(`/account/${result._id}`).json({
            _id: result._id,
            idnum,
            email,
            lastName,
            firstName,
            middleName,
            kind
        });
    } catch (error) {
        return res.error(error, 'Cannot create account');
    }
});

AccountController.patch('/account/:id', requireToken, async (req, res) => {
    const { id } = req.params;
    const token = req.token;
    
    try {
        const isAdmin = token.kind.toLowerCase() === 'administrator';

        const account = await Account.User.findById(id);
        if (!account) throw new ServerError(404, 'Account not found');

        return res.json({});
    } catch (error) {
        return res.error(error, 'Cannot get account');
    }
});

module.exports = AccountController;
