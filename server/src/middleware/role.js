const Token = require('../models/token')

/**
 * Ensure the user's kind before running the endpoint.
 * 
 * @param {string | string[]} role The user kind(s) required to run this facility
 */
function checkKind(kind) {
    /**
     * 
     * @param {import('express').Request} req Incoming request
     * @param {import('express').Response} res Outgoing response (used in case of error)
     * @param {import('express').NextFunction} next Next function to run
     */
    return async function(req, res, next) {
        /*// Retrieve the token
        const token = req.token
        if (!token) {
            return res.status(401).json({
                message: 'No token'
            })
        }

        const func = typeof kind === 'string'
            ? e => e.toLowerCase() === kind
            : e => kind.some(e1 => e1 === e.toLowerCase())

        if (!func(token.kind)) {
            return res.status(401).json({
                message: 'Not in kind'
            })
        }*/
    
        // Run the next middleware or function
        next()
    }
}

/**
 * Ensure the user's role before running the endpoint.
 * 
 * @param {string | string[]} role The user role(s) required to run this facility
 */
function checkRole(role) {
    /**
     * 
     * @param {import('express').Request} req Incoming request
     * @param {import('express').Response} res Outgoing response (used in case of error)
     * @param {import('express').NextFunction} next Next function to run
     */
    return async function(req, res, next) {
        // Retrieve the tokeb
        /*const token = req.token
        if (!token) {
            return res.status(401).json({
                message: 'No token'
            })
        }

        const fun = typeof role === 'string' ? e => e.toLowerCase() === role : e => role.some(e1 => e1 === e.toLowerCase())
        if (!token.roles.some(fun)) {
            return res.status(401).json({
                message: 'Not in role'
            })
        }*/
    
        // Run the next middleware or function
        next()
    }
}

module.exports = { checkKind, checkRole }
