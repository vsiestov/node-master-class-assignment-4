const validation = require('../lib/validation');
const users = require('../modules/users/users.module');
const tokens = require('../modules/tokens/tokens.module');
const config = require('../config/config');
const { hash } = require('../lib/helpers');

/**
 * General list of routes.
 * Sign in/up, logout and get/update info about signed user
 *
 * @param {String} path - endpoint path
 * @param {Object} router - application router
 */

module.exports = (path, router) => {

    /**
     * User can be signed up using this route /sign-up
     */
    router.post(`${path}/sign-up`, validation({
        email: {
            type: 'string',
            match: /[a-z0-9_\-+]@[a-z0-9]{2,}\.[a-z]{2,}/,
            required: true
        },
        password: {
            min: 6,
            max: 10,
            required: true
        },
        firstName: {
            required: true
        },
        lastName: {
            required: true
        }
    }), (req, res) => {
        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        const body = req.body;

        body.password = hash(body.password);

        return users.create(body)
            .then((response) => {
                delete response.password;

                // Create a token for newly registered user for further using

                return tokens.create({
                    email: response.email,
                    expires: Date.now() + config.tokenExpiration
                })
                    .then((token) => {
                        return res.send({
                            ...response,
                            ...{
                                token: token.id
                            }
                        });
                    });
            })
            .catch((error) => {
                return res.send({
                    errors: [error]
                }, 500);
            });
    });

    /**
     * User can be signed in using this route /sign-in
     */
    router.post(`${path}/sign-in`, validation({
        email: {
            required: true
        },
        password: {
            required: true
        }
    }), (req, res) => {
        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        const body = req.body;

        users.findOne(body.email)
            .then((response) => {
                if (hash(body.password) === response.password) {

                    delete response.password;

                    // Create a token for newly registered user for further using

                    return tokens.create({
                        email: response.email,
                        expires: Date.now() + config.tokenExpiration
                    })
                        .then((token) => {
                            return res.send({
                                ...response,
                                ...{
                                    token: token.id
                                }
                            });
                        });

                } else {
                    res.send({
                        errors: [
                            'Your password or email are not valid'
                        ]
                    });
                }
            })
            .catch((error) => {
                res.send({
                    errors: [error]
                });
            });
    });

    /**
     * User can logout using this route /logout
     */
    router.delete(`${path}/logout`, tokens.verify(), (req, res) => {
        const token = req.token;

        tokens.delete(token)
            .then(() => {
                res.send({
                    message: 'Logout successfully completed'
                });
            })
            .catch((error) => {
                res.send({
                    errors: [error]
                }, 500);
            });
    });

    /**
     * Get info about user /me
     */
    router.get(`${path}/me`, tokens.verify(), (req, res) => {
        const user = req.user;

        delete user.password;

        res.send(user);
    });

    /**
     * User can update its own info. User can update its own info but password and email
     */
    router.put(`${path}/me`, tokens.verify(), validation({
        firstName: {
            required: true
        },
        lastName: {
            required: true
        },
        address: {
            min: 1,
            max: 100
        }
    }), (req, res) => {

        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        const user = req.user;
        const body = req.body;

        delete body.password;
        delete body.email;

        const data = {
            ...user,
            ...body
        };

        users.update(user.email, data)
            .then(() => {
                delete data.password;

                res.send(data);
            })
            .catch((error) => {
                res.send({
                    errors: [error]
                });
            });
    });
};