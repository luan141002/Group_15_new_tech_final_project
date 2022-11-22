const isInRole = require('../utility/isInRole')

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

        if (!isInRole(token, roles)) {
            return res.status(401).json({
                message: 'You do not have the permission to run this operation'
            })
        }
    
        // Run the next middleware or function
        next()
    }
}

module.exports = { checkRole }
