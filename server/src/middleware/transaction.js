const { startSession } = require('../data')

/**
 * Indicates the endpoint will utilize a database transaction.
 * 
 * @param {import('express').Request} req Incoming request
 * @param {import('express').Response} res Outgoing response (used in case of error)
 * @param {import('express').NextFunction} next Next function to run
 */
async function transacted(req, res, next) {
    const session = await startSession()
    session.startTransaction()

    req.transaction = session
    res.on('finish', async () => {
        await session.endSession()
    })

    // Run the next middleware or function
    next()
}

module.exports = transacted
