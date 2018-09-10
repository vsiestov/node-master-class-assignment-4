const validation = require('../lib/validation');
const users = require('../modules/users/users.module');
const tokens = require('../modules/tokens/tokens.module');
const { isAdmin } = require('../lib/helpers');

/**
 * Users application endpoints. Only admin can access these list of endpoints
 *
 * @param {String} path - endpoint path
 * @param {Object} router - application router
 */

module.exports = (path, router) => {

    const emailRegExp = /[a-z0-9_\-+]@[a-z0-9]{2,}\.[a-z]{2,}/;

    /**
     * User with admin credentials can get the list of users or a user by id
     */
    router.get(`/${path}`, tokens.verify(), isAdmin, (req, res) => {
        return Promise.resolve()
            .then(() => {
                if (req.query.email) {
                    return users.findOne(req.query.email)
                }

                return users.find();
            })
            .then((response) => {
                return res.send(response.map((item) => {
                    delete item.password;

                    return item;
                }));
            })
            .catch((error) => {
                return res.send({
                    errors: [error]
                }, 500);
            });
    });

    /**
     * User with admin credentials can create a new user
     */
    router.post(`/${path}`, tokens.verify(), isAdmin, validation({
        email: {
            type: 'string',
            match: emailRegExp,
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

        return users.create(req.body)
            .then((response) => {
                return res.send(response);
            })
            .catch((error) => {
                return res.send({
                    errors: [error]
                }, 500);
            });
    });

    /**
     * User with admin credentials can update a user
     */
    router.put(`/${path}`, tokens.verify(), isAdmin, validation({
        email: {
            type: 'string',
            match: emailRegExp,
            required: true
        }
    }), (req, res) => {

        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        const body = req.body;

        return users.update(body.email, body)
            .then((response) => {
                return res.send(response);
            })
            .catch((error) => {
                return res.send({
                    errors: [error]
                }, 500);
            });
    });

    /**
     * User with admin credentials can delete a user
     */
    router.delete(`/${path}`, tokens.verify(), isAdmin, validation({
        email: {
            type: 'string',
            match: emailRegExp,
            required: true
        }
    }), (req, res) => {
        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        return users.delete(req.query.email)
            .then(() => {
                return res.send({
                    message: 'The record has been deleted'
                });
            })
            .catch((error) => {
                return res.send({
                    errors: [error]
                }, 500);
            });
    });

};