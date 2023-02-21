const ServerError = require('./error')

function errorResponse(err, message, details) {
    const res = this;

    if (err instanceof ServerError) {
        return res.status(err.status).json({
            message: err.message,
            details: err.details
        })
    }

    console.log(err);
    if (typeof message === 'string') {
        return res.status(500).json({ message, details })
    } else {
        return res.status(500).json(message)
    }
}

module.exports = errorResponse
