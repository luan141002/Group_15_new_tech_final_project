const Token = require('../models/token')

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next 
 */
async function readToken(req, res, next) {
    const header = req.headers['authorization']
    if (!header) {
        return res.status(401).json({
            message: 'Missing authorization header'
        })
    }

    if (!header.startsWith('Bearer')) {
        return res.status(401).json({
            message: 'Invalid authorization header'
        })
    }

    const token = header.split(' ')[1]
    if (!token) {
        return res.status(401).json({
            message: 'Invalid access token'
        })
    }

    const accessToken = await Token.findOne({ id: token }).lean()
    if (!accessToken) {
        return res.status(401).json({
            message: 'Invalid access token'
        })
    }
    req.token = accessToken

    if (accessToken.invalidated || (!accessToken.expiresAt && Date.now() >= accessToken.expiresAt)) {
        return res.status(401).json({
            message: 'Invalid or expired access token'
        })
    }

    next()
}

module.exports = readToken
