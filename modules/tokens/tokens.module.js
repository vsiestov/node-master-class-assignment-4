const { CRUD } = require('../../lib/db');
const { randomString } = require('../../lib/helpers');
const users = require('../users/users.module');

/**
 * This class provides operations with user's tokens
 */
class Tokens extends CRUD {
    constructor() {
        super('id', 'tokens')
    }

    /**
     * Generate token id and save it
     *
     * @param {Object} params - token params
     * @returns {Promise<params>} - saved result
     */
    create(params) {
        params.id = randomString(20);

        return super.create(params);
    }

    /**
     * Check provided token and extend request object with retrieved user information
     *
     * @returns {Function} - callback middleware function
     */
    verify() {
        return (req, res, next) => {
            const token = req.headers.token || req.body.token || req.query.token;

            if (!token) {
                return res.send({
                    errors: [
                        'You are not authorized for this resource'
                    ]
                });
            }

            this.findOne(token)
                .then((response) => {
                    if (response.expires < Date.now()) {
                        return Promise.reject('Your token is expired');
                    }

                    return users.findOne(response.email);
                })
                .then((response) => {
                    req.user = response;
                    req.token = token;

                    return next();
                })
                .catch((error) => {
                    if (error.code === 'ENOENT') {
                        return res.send({
                            errors: ['You are not authorized for this resource']
                        }, 500);
                    }

                    return res.send({
                        errors: [error]
                    }, 500);
                });
        }
    }
}

module.exports = new Tokens();
