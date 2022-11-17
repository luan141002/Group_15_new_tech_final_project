const Token = require('../models/token')
const jwt = require('jsonwebtoken')

/**
 * Reads the token from the authorization header.
 * 
 * @param {import('express').Request} req Incoming request
 * @param {import('express').Response} res Outgoing response (used in case of error)
 * @param {import('express').NextFunction} next Next function to run
 */
async function readToken(req, res, next) {
    let rawToken = ''
    let accessToken = {}
    
    // Retrieve the authorization header
    const header = req.headers['authorization']
    if (header) {
        // Authorization header exists

        // Ensure it is a Bearer token
        if (!header.startsWith('Bearer')) {
            return res.status(401).json({
                message: 'Invalid authorization header'
            })
        }
    
        // Get the bearer token (the second part)
        const token = header.split(' ')[1]
        if (!token) {
            return res.status(401).json({
                message: 'Invalid access token'
            })
        }

        rawToken = token

        /*
        // Find the token in the database
        const accessToken = await Token.findOne({ id: token }).lean()
        if (!accessToken) {
            return res.status(401).json({
                message: 'Invalid access token'
            })
        }
        req.token = accessToken
    
        // Ensure the token is not expired or invalidated
        if (accessToken.invalidated || (!accessToken.expiresAt && Date.now() >= accessToken.expiresAt)) {
            return res.status(401).json({
                message: 'Invalid or expired access token'
            })
        }
        */
    } else if (req.cookies) {
        // Use http cookie instead

        const token = req.cookies.accessToken
        if (!token) {
            /*return res.status(401).json({
                message: 'Missing authorization header or cookie'
            })*/
        }

        rawToken = token
    } else {
        /*return res.status(401).json({
            message: 'Missing authorization header or cookie'
        })*/
    }

    try {
        accessToken = jwt.verify(rawToken, process.env.JWT_SECRET)
    } catch (err) {
        /*return res.status(401).json({
            message: 'Cannot decode token',
            details: err
        })*/
    }

    req.token = accessToken

    // Run the next middleware or function
    next()
}

module.exports = readToken
