const express = require('express');
const Account = require('../models/Account');
const requireToken = require('../middleware/requireToken');
const ServerError = require('../utility/error');
const multer = require('multer');
const sharp = require('sharp');
const randomjs = require('random-js');
const crypto = require('crypto');
const isQueryTrue = require('../utility/isQueryTrue');

const AccountController = express.Router();
const upload = multer();

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
            /*idnum: isAdmin ? e.idnum : undefined,*/
            lastName: e.lastName,
            firstName: e.firstName,
            middleName: e.middleName,
            kind: e.kind.toLowerCase(),
            accessCode: isAdmin ? e.accessCode : undefined,
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
        const canSeePrivate = token.accountID === id || isAdmin;

        const result = await Account.User.findById(id);
        return res.json({
            _id: result._id,
            /*idnum: isAdmin ? result.idnum : undefined,*/
            lastName: result.lastName,
            firstName: result.firstName,
            middleName: result.middleName,
            kind: result.kind.toLowerCase(),
            email: canSeePrivate ? result.email : undefined,
            accessCode: isAdmin ? result.accessCode : undefined,
            joined: result.joined
        });
    } catch (error) {
        return res.error(error, 'Cannot get account');
    }
});

AccountController.delete('/account/:id', requireToken, async (req, res) => {
    const { id } = req.params;
    const token = req.token;
    
    try {
        const isAdmin = token.kind.toLowerCase() === 'administrator';
        if (!isAdmin) throw new ServerError(403, 'Only administrators can delete accounts');

        const account = Account.User.findById(id);
        if (!account) throw new ServerError(404, 'Account not found');

        if (account.kind.toLowerCase() === 'administrator') throw new ServerError(403, 'Cannot remove administrator account');
        await Account.User.deleteOne({ _id: id });
        return res.sendStatus(204);
    } catch (error) {
        return res.error(error, 'Cannot get account');
    }
});

function seedFromAccount(account, salt) {
    const hasher = crypto.createHash('sha256');
    hasher.update(account._id.toString());
    hasher.update(account.lastName);
    hasher.update(account.firstName);
    hasher.update(salt || '');
    const buffer = hasher.digest();
    const ibuf = new Int32Array(buffer, 0, 1);
    return ibuf[0];
}

function randomColor(seed) {
    const engine = randomjs.MersenneTwister19937.seed(seed);
    const distribution = randomjs.integer(75, 180);
    
    function randomNumber() {
        return distribution(engine);
    }

    function toHex(num) {
        const hex = num.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    const r = randomNumber();
    const g = randomNumber();
    const b = randomNumber();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

AccountController.get('/account/:id/image', requireToken, async (req, res) => {
    const { id } = req.params;
    const { thumbnail, size, width, height } = req.query;
    
    try {
        const result = await Account.User.findById(id);
        if (!result) throw new ServerError(404, 'error.account.no_account', 'Account not found.');
        
        let nWidth = Number.parseInt(width);
        let nHeight = Number.parseInt(height);
        let nSize = Number.parseInt(size);
        
        if (!nSize) {
            nSize = isQueryTrue(thumbnail) ? 48 : 216;
        }
        
        if (!nWidth || !nHeight) {
            nWidth = nSize;
            nHeight = nSize;
        }

        const background = randomColor(seedFromAccount(result, ''));

        let photo = result.photo;
        let mime = 'image/jpeg';
        if (!photo) {
            const { lastName, firstName } = result;
            const lastInitial = lastName[0].toUpperCase();
            const firstInitial = firstName[0].toUpperCase();
            mime = 'image/png';

            const spacing = 36 / 72 * nHeight;

            const svg = `
            <svg width="${nWidth}" height="${nHeight}" xmlns="http://www.w3.org/2000/svg">
                <style>
                    .title {
                        fill: white;
                        font-size: ${spacing}px;
                        font-family: sans-serif;
                    }
                </style>
                <text
                    x="50%"
                    y="50%"
                    dy="0.3125em"
                    text-anchor="middle"
                    class="title"
                >
                    ${firstInitial + lastInitial}
                </text>
            </svg>
            `;

            const svgBuffer = Buffer.from(svg);
            const avatar = sharp({
                create: {
                    width: nWidth,
                    height: nHeight,
                    channels: 3,
                    background
                }
            }).composite([
                { input: svgBuffer }
            ]);
        
            photo = await avatar.png().toBuffer();
        } else {
            if (nSize) {
                photo = await sharp(photo)
                    .resize(nWidth, nHeight)
                    .jpeg()
                    .toBuffer();
            } else if (nSize) {
                photo = await sharp(photo)
                    .jpeg()
                    .toBuffer();
            }
        }
        
        return res
            .header('Content-Type', mime)
            .header('Cache-Control', 'public, max-age=3600')
            .send(photo);
    } catch (error) {
        return res.error(error, 'Cannot get account');
    }
});

const TYPES = ['student', 'faculty', 'administrator'];

AccountController.post('/account', requireToken, async (req, res) => {
    const body = req.body;
    let entries = [body];
    if (Array.isArray(body)) entries = body;

    const token = req.token;
    const errors = [];
    
    const added = [];
    try {
        const results = [];
    
        const distribution = randomjs.integer(1, 999999);

        for (let i = 0; i < entries.length; i++) {
            const { email, lastName, firstName, middleName, kind } = entries[i];
            if (!email) errors.push({ fieldName: 'email', index: i, message: 'Email address is required' });
            if (!lastName) errors.push({ fieldName: 'lastName', index: i, message: 'Last name is required' });
            if (!firstName) errors.push({ fieldName: 'firstName', index: i, message: 'First name is required' });
            if (!TYPES.includes(kind)) errors.push({ fieldName: 'kind', index: i, message: 'Invalid account type' });
            if (errors.length > 0) throw new ServerError(400, 'Form error', errors);
    
            let schema = Account.User;
            switch (kind) {
                case 'administrator': schema = Account.Administrator; break;
                case 'faculty': schema = Account.Faculty; break;
                case 'student': schema = Account.Student; break;
            }
            const seed = seedFromAccount({
                _id: '000000000000000000000000',
                lastName,
                firstName,
            }, '')
            const engine = randomjs.MersenneTwister19937.seed(seed);

            const result = await schema.create({
                email,
                lastName,
                firstName,
                middleName,
                accessCode: distribution(engine).toString().padStart(6, '0')
            });

            added.push(result._id);
            results.push({
                _id: result._id,
                email,
                lastName,
                firstName,
                middleName,
                kind,
                accessCode: result.accessCode
            });
        }

        if (results.length === 1) {
            const result = results[0];
            return res.status(201).location(`/account/${result._id}`).json(result);
        } else {
            return res.status(200).json(results);
        }
    } catch (error) {
        for (const id of added) {
            await Account.User.deleteOne({ _id: id });
        }

        return res.error(error, 'Cannot create account');
    }
});

AccountController.patch('/account/:id', requireToken, upload.single('photo'), async (req, res) => {
    const { id } = req.params;
    const token = req.token;

    console.log(req.file);

    try {
        const isAdmin = token.kind.toLowerCase() === 'administrator';
        const isCurrentUser = id === token.accountID;

        const account = await Account.User.findById(id);
        if (!account) throw new ServerError(404, 'Account not found');

        if (isCurrentUser || isAdmin) {
            const { currentPassword, newPassword, retypePassword } = req.body;
            if (newPassword) {
                if (!currentPassword) throw new ServerError(400, 'error.validation.current_password', 'Current password is required');
                if (!retypePassword) throw new ServerError(400, 'error.validation.retype_password', 'Password must be retyped');
                if (newPassword !== retypePassword) throw new ServerError(400, 'error.validation.password_mismatch', 'Password mismatch');
    
                if (!await Account.User.verifyPassword(currentPassword, account.password))
                    throw new ServerError(400, 'error.auth.invalid_password', 'Password is incorrect');
    
                account.password = newPassword;
            }

            if (req.file) {
                account.photo = req.file.buffer;
                account.photoType = req.file.mimetype;
            }
        }

        if (isAdmin) {

        }

        await account.save();

        return res.sendStatus(204);
    } catch (error) {
        return res.error(error, 'Cannot get account');
    }
});

module.exports = AccountController;
