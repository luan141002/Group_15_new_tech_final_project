/**
 * Generates a username from the last and first name
 * 
 * @param {import('express').Request} req Incoming request
 * @param {import('express').Response} res Outgoing response (used in case of error)
 * @param {import('express').NextFunction} next Next function to run
 */
function generateName(lastName, firstName) {
    const lastNames = lastName.toLowerCase().replace(/[\.,]/, '').replace(/[\-]/, ' ').split(/\s+/)
    const firstNames = firstName.toLowerCase().replace(/[\.,]/, '').replace(/[\-]/, ' ').split(/\s+/)

    return [...firstNames, ...lastNames].join('.')
}

function decorateName(genName, number) {
    return typeof number !== 'undefined' ? `${genName}.${number}` : genName
}

module.exports = { generateName, decorateName }
