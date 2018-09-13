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

    checkToken(req) {
        return new Promise((fullFill, reject) => {
            const token = req.headers.token || req.body.token || req.query.token || req.cookies.token;

            if (!token) {
                return reject('You are not authorized for this resource')
            }

            this.findOne(token)
                .then((response) => {
                    if (!response || response.expires < Date.now()) {
                        return Promise.reject('Your token is expired');
                    }

                    return users.findOne(response.email);
                })
                .then((response) => {
                    req.user = response;
                    req.token = token;

                    return fullFill();
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }

    /**
     * Check provided token and extend request object with retrieved user information
     *
     * @returns {Function} - callback middleware function
     */
    verify() {
        return (req, res, next) => {
            this.checkToken(req)
                .then(() => {
                    return next();
                })
                .catch((error) => {

                    if (req.headers['content-type'] === 'application/json') {
                        return res.send({
                            errors: [
                                error
                            ]
                        }, 401);
                    }

                    res.writeHead(301, {
                        Location: '/error'
                    });

                    return res.end();
                });
        }
    }
}

module.exports = new Tokens();
