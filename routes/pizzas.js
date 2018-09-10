const tokens = require('../modules/tokens/tokens.module');
const pizzas = require('../modules/pizzas/pizzas.module');
const { isAdmin } = require('../lib/helpers');
const validation = require('../lib/validation');

/**
 * Pizzas application endpoints.
 *
 * @param {String} path - endpoint path
 * @param {Object} router - application router
 */

module.exports = (path, router) => {

    /**
     * Get list of all menu items or get an item by id. Only authorized user can access this route
     */
    router.get(`/${path}`, tokens.verify(), (req, res) => {

        return Promise.resolve()
            .then(() => {
                if (req.query.id) {
                    return pizzas.findOne(req.query.id)
                }

                return pizzas.find();
            })
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
     * User with admin credentials can create an item
     */
    router.post(`/${path}`, tokens.verify(), isAdmin, validation({
        name: {
            type: 'string',
            min: 5,
            max: 50,
            required: true
        },
        description: {
            type: 'string',
            min: 10,
            max: 500,
            required: true
        },
        price: {
            type: 'number',
            min: 50
        }
    }), (req, res) => {

        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        return pizzas.create(req.body)
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
     * User with admin credentials can update an item by id
     */
    router.put(`/${path}`, tokens.verify(), isAdmin, validation({
        id: {
            type: 'string',
            required: true
        },
        name: {
            type: 'string',
            min: 5,
            max: 50
        },
        description: {
            type: 'string',
            min: 10,
            max: 500
        },
        price: {
            type: 'number',
            min: 50
        }
    }), (req, res) => {

        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        const body = req.body;

        return pizzas.update(body.id, body)
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
     * User with admin credentials can delete an item
     */
    router.delete(`/${path}`, tokens.verify(), isAdmin, validation({
        id: {
            type: 'string',
            required: true
        }
    }), (req, res) => {
        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        return pizzas.delete(req.query.id)
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