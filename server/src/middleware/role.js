const Token = require('../models/token')

/**
 * Ensure the user's kind before running the endpoint.
 * 
 * @param {string | string[]} roles The user kind (and role) required to run this facility
 *                                  Syntax: <kind> - must be of this user type
 *                                          <kind.role> - must be of this user type AND role
 */
function checkRole(roles) {
    /**
     * 
     * @param {import('express').Request} req Incoming request
     * @param {import('express').Response} res Outgoing response (used in case of error)
     * @param {import('express').NextFunction} next Next function to run
     */
    return async function(req, res, next) {
        // Retrieve the token
        const token = req.token
        if (!token) {
            return res.status(401).json({
                message: 'No token'
            })
        }

        // Skip role checks if superadmin
        if (token.superadmin) {
            return next()
        }

        const checkPerm = (kind, roles, entry) => {
            if (entry.includes('.')) {
                const [eKind, eRole] = entry.split(/\./)
                return eKind === kind.toLowerCase() && roles.map(e => e.toLowerCase()).includes(eRole)
            } else {
                return kind.toLowerCase() === entry
            }
        }

        const func = typeof roles === 'string'
            ? checkPerm
            : (kind, roles, entries) => entries.some(e => checkPerm(kind, roles, e))

        if (!func(token.kind, token.roles, roles)) {
            return res.status(401).json({
                message: 'Not in role'
            })
        }
    
        // Run the next middleware or function
        next()
    }
}

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
        return res.status(500).json({
            message: 'checkKind is no longer supported; please convert to checkRole'
        })

        // Retrieve the token
        const token = req.token
        if (!token) {
            return res.status(401).json({
                message: 'No token'
            })
        }

        // Skip role checks if superadmin
        if (token.superadmin) {
            return next()
        }

        const func = typeof kind === 'string'
            ? e => e.toLowerCase() === kind
            : e => kind.some(e1 => e1 === e.toLowerCase())

        if (!func(token.kind)) {
            return res.status(401).json({
                message: 'Not in kind'
            })
        }
    
        // Run the next middleware or function
        next()
    }
}

module.exports = { checkKind, checkRole }
