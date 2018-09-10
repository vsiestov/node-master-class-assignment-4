const tokens = require('../modules/tokens/tokens.module');
const carts = require('../modules/carts/carts.module');
const validation = require('../lib/validation');
const pizzas = require('../modules/pizzas/pizzas.module');

/**
 * carts.application endpoints
 *
 * @param {String} path - endpoint path
 * @param {Object} router - application router
 */

module.exports = (path, router) => {

    /**
     * Get extended info about pizza items
     *
     * @param {Array<ICartItem>} list
     * @returns {Promise<Array<IPizzaItem>>} - the list of pizzas
     */
    const getPizzaInfo = (list) => {
        return Promise.all(list.map((item) => {
            return pizzas.findOne(item.id)
                .then((response) => {
                    response.count = item.count;

                    return response;
                });
        }));
    };

    /**
     * Get items from the cart
     */
    router.get(`/${path}`, tokens.verify(), (req, res) => {

        return Promise.resolve()
            .then(() => { // Find user's cart
                return carts.findOne(req.user.email)
            })
            .then((response) => { // Get extended info about cart items
                return getPizzaInfo(response || []);
            })
            .then((response) => {
                res.send(response);
            })
            .catch((error) => {
                return res.send({
                    errors: [error]
                }, 500);
            });
    });

    /**
     * Put an item into the cart
     */
    router.post(`/${path}`, tokens.verify(), validation({
        id: {
            type: 'string',
            required: true
        },
        count: {
            type: 'number',
            min: 1,
            required: true
        }
    }), (req, res) => {

        if (req.errors && req.errors.length) {
            return res.send({
                errors: req.errors
            }, 422);
        }

        const body = req.body;

        body.email = req.user.email;

        return pizzas.findOne(body.id)
            .then((response) => {
                if (!response) {
                    return Promise.reject('Could not find chosen pizza');
                }

                body.price = response.price;

                return carts.create(body);
            })
            .then((response) => {
                return getPizzaInfo(response);
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
     * Update an item in the cart
     */
    router.put(`/${path}`, tokens.verify(), validation({
        id: {
            type: 'string',
            required: true
        },
        count: {
            type: 'number',
            min: 1,
            required: true
        }
    }), (req, res) => {

        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        const body = req.body;

        return pizzas.findOne(body.id)
            .then((response) => {
                if (!response) {
                    return Promise.reject('Could not find chosen pizza');
                }

                body.price = response.price;

                return carts.update(req.user.email, body);
            })
            .then((response) => {
                return getPizzaInfo(response);
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
     * Delete an item from the cart
     */
    router.delete(`/${path}`, tokens.verify(), validation({
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

        return carts.delete(req.user.email, req.query.id)
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