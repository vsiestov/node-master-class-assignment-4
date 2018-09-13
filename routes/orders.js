const validation = require('../lib/validation');
const orders = require('../modules/orders/orders.module');
const tokens = require('../modules/tokens/tokens.module');
const carts = require('../modules/carts/carts.module');
const template = require('../modules/template/template.module');

/**
 * Users application endpoints
 *
 * @param {String} path - endpoint path
 * @param {Object} router - application router
 */

module.exports = (path, router) => {

    const viewLocation = `${__dirname}/../views`;

    /**
     * Render checkout page
     *
     * @param {String} orderId - order id
     * @param {IOrder} response - order data
     * @returns {Promise<String>}
     */
    const renderCheckoutPage = (orderId, response) => {
        const list = response.items;
        const count = list.length;
        let amount = 0;

        for (let i = 0; i < count; i++) {
            amount += list[i].price * list[i].count;
        }

        return template.render(viewLocation, 'order.html', {
            title: 'Pizza delivery :: checkout',
            list: response,
            header: 'Checkout',
            amount,
            orderId
        });
    };

    /**
     * Get the list of orders
     */
    router.get(`/${path}`, tokens.verify(), validation({
        email: {
            required: true
        }
    }), (req, res) => {
        const isJson = req.headers['content-type'] === 'application/json';

        return Promise.resolve()
            .then(() => {
                if (req.query.id) {
                    return orders.findOne(req.user.email, req.query.id)
                }

                return orders.find(req.user.email);
            })
            .then((response) => {
                if (!isJson) {
                    if (req.query.id) {
                        return renderCheckoutPage(req.query.id, response)
                            .then((response) => {
                                res.sendHtml(response);
                            });
                    }

                    return template.render(viewLocation, 'orders.html', {
                        title: 'Pizza Delivery Service :: Orders',
                        header: 'Your orders',
                        list: response.map((item) => {
                            item.itemsCount = item.items.length;
                            item.link = `/orders?id=${item.id}`;
                            item.amount = (() => {
                                let result = 0;

                                for (let i = 0; i < item.itemsCount; i++) {
                                    result += item.items[i].price * item.items[i].count
                                }

                                return result;
                            })();

                            return item;
                        })
                    })
                        .then((response) => {
                            res.sendHtml(response);
                        });
                }

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
        const isJson = req.headers['content-type'] === 'application/json';

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
                if (!isJson) {
                    return renderCheckoutPage(response.id, response)
                        .then((response) => {
                            res.sendHtml(response);
                        });
                }

                return res.send(response);
            })
            .catch((error) => {

                if (!isJson) {
                    return template.render(viewLocation, 'error.html', {
                        title: 'Pizza delivery :: Error',
                        header: 'You have an error',
                        message: error
                    })
                        .then((response) => {
                            res.sendHtml(response);
                        });
                }

                return res.send({
                    errors: [error]
                }, 500);
            });
    });

    /**
     * Pay an order
     */
    router.post(`/${path}/pay`, tokens.verify(), validation({
        id: {
            required: true
        },
        source: {
            required: true
        }
    }), (req, res) => {
        const isJson = req.headers['content-type'] === 'application/json';

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

                if (!isJson) {
                    return template.render(viewLocation, 'payment.html', {
                        title: 'Pizza delivery :: Success',
                        list: response,
                        header: 'Success payment'
                    })
                        .then((response) => {
                            res.sendHtml(response);
                        });
                }

                return res.send(response);
            })
            .catch((error) => {
                if (!isJson) {

                    req.flash({
                        errors: [error]
                    });

                    res.writeHead(301, {
                        Location: '/error'
                    });

                    return res.end();
                }

                return res.send({
                    errors: [error]
                }, 500);
            });
    });

};