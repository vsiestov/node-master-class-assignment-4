const mailgun = require('../mailgun/mailgun.module');
const stripe = require('../stripe/stripe.module');
const { CRUD } = require('../../lib/db');
const { randomString } = require('../../lib/helpers');
const users = require('../users/users.module');

/**
 * @typedef {Object} IOrder
 *
 * @property {String} id
 * @property {String} status
 * @property {String} userId
 * @property {Array<IPizzaItem>} items
 * @property {String} stripeId
 */

class Orders extends CRUD {
    constructor() {
        super('id', 'orders')
    }

    /**
     * Get a list of the user's orders
     *
     * @param {String} userId - user identity
     * @returns {Promise<Array<IOrder>>}
     */
    find(userId) {
        return users.findOne(userId)
            .then((response) => {
                const orders = response.orders || [];

                return Promise.all(orders.map((item) => {
                    return super.findOne(item);
                }));
            });
    }

    /**
     * Get user's order by id
     *
     * @param {String} userId - user's identity
     * @param {String} orderId - order's identity
     * @returns {Promise<IOrder>}
     */
    findOne(userId, orderId) {
        return users.findOne(userId)
            .then((response) => {

                const orders = response.orders || [];
                const index = orders.indexOf(orderId);

                if (index === -1) {
                    return null
                }

                return super.findOne(orders[index]);
            });
    }

    /**
     * Generate token id and save it
     *
     * @param {Object} params - order params
     * @param {String} userId - user identity
     * @returns {Promise<IOrder>} - saved result
     */
    create(params, userId) {
        params.id = randomString(20);

        return super.create(params)
            .then((response) => {
                return users.findOne(userId)
                    .then((userResponse) => {
                        const orders = userResponse.orders || [];

                        orders.push(response.id);

                        return users.update(userResponse.email, Object.assign({}, userResponse, {
                            orders
                        }));
                    })
                    .then(() => {
                        return response;
                    });
            });
    }

    /**
     * Payment handler
     *
     * @param {String} id - order id
     * @param {String} source - stripe credit card token
     * @param {IUser} user - user who is doing this payment
     * @returns {Promise<IOrder>} - result order object
     */
    pay(id, source, user) {
        return super.findOne(id)
            .then((response) => {
                let amount = 0;
                const list = response.items;
                const count = list.length;

                if (response.status === 'paid') {
                    return Promise.reject('This order is already paid');
                }

                for (let i = 0; i < count; i++) {
                    amount += list[i].price * list[i].count;
                }

                return stripe.charge.create(
                    source,
                    amount,
                    `Payment from ${user.firstName} ${user.lastName} (${user.email}) for pizza delivery`
                )
                    .then((stripeResponse) => {
                        response.status = 'paid';
                        response.stripeId = stripeResponse.body.id;

                        return super.update(id, response);
                    });
            })
            .then((response) => {

                // Send email notification for current user about success payment operation
                process.nextTick(() => {
                    mailgun
                        .send(user.email, 'Pizza delivery payment', 'You payment for pizza delivery successfully completed')
                        .then((response) => {
                            console.log(response.body);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                });

                return response;
            });
    }
}

module.exports = new Orders();
