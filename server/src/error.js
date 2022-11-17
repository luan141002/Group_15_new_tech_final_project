function ServerError(status, message, details) {
    this.status = status
    this.message = message
    this.details = details
    return this
}

module.exports = ServerError
