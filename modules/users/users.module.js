const { CRUD } = require('../../lib/db');

/**
 * @typedef {Object} IUser
 *
 * @property {String} firstName
 * @property {String} lastName
 * @property {String} email
 * @property {String} password
 * @property {String} address
 */

class Users extends CRUD {
    constructor() {
        super('email', 'users')
    }
}

module.exports = new Users();
