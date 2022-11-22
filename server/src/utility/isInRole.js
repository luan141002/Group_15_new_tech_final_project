
/**
 * Ensure the account has the specified role(s).
 * 
 * @param {{ kind: string, roles: string[] }} account
 *      The account whose roles are to be checked
 * @param {string | string[]} roleOrRoles
 *      The user kind (and role) required to run this facility
 *      Syntax: <kind> - must be of this user type
 *              <kind.role> - must be of this user type AND role
 */
function isInRole(account, roleOrRoles) {
    const checkPerm = (kind, roles, entry) => {
        if (entry.includes('.')) {
            const [eKind, eRole] = entry.split(/\./)
            return eKind === kind.toLowerCase() && roles.map(e => e.toLowerCase()).includes(eRole)
        } else {
            return kind.toLowerCase() === entry
        }
    }

    const func = typeof roleOrRoles === 'string'
        ? checkPerm
        : (kind, roles, entries) => entries.some(e => checkPerm(kind, roles, e))

    return func(account.kind, account.roles, roleOrRoles)
}

module.exports = isInRole
