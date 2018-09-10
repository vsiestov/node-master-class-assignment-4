const validation = require('../lib/validation');
const orders = require('../modules/orders/orders.module');
const tokens = require('../modules/tokens/tokens.module');
const carts = require('../modules/carts/carts.module');

/**
 * Users application endpoints
 *
 * @param {String} path - endpoint path
 * @param {Object} router - application router
 */

module.exports = (path, router) => {

    /**
     * Get the list of orders
     */
    router.get(`/${path}`, tokens.verify(), validation({
        email: {
            required: true
        }
    }), (req, res) => {
        return Promise.resolve()
            .then(() => {
                if (req.query.id) {
                    return orders.findOne(req.user.email, req.query.id)
                }

                return orders.find(req.user.email);
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
     * User with admin credentials can create a new user
     */
    router.post(`/${path}`, tokens.verify(), (req, res) => {

        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        const user = req.user;

        return carts.findOne(user.email)
            .then((response) => {

                if (!response || !response.length) {
                    return Promise.reject('Your cart is empty. Add new items to your cart to make an order');
                }

                return orders.create({
                    status: 'created',
                    userId: user.email,
                    items: response
                }, user.email);
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
     * Pay an order
     */
    router.put(`/${path}/pay`, tokens.verify(), validation({
        id: {
            required: true
        },
        source: {
            required: true
        }
    }), (req, res) => {

        if (req.errors && req.errors.length) {

            return res.send({
                errors: req.errors
            }, 422);
        }

        const body = req.body;
        const user = req.user;

        return orders.pay(body.id, body.source, user)
            .then((response) => {

                // Clear cart after success payment
                process.nextTick(() => {
                    carts.empty(user.email)
                        .catch((error) => {
                            console.log('Could not empty users cart', error);
                        });
                });

                return res.send(response);
            })
            .catch((error) => {
                return res.send({
                    errors: [error]
                }, 500);
            });
    });

};