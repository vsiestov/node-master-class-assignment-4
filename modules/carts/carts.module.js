const { CRUD } = require('../../lib/db');
const helpers = require('../../lib/helpers');

/**
 * @typedef {Object} ICartItem
 *
 * @property {String} id
 * @property {Number} count
 */


class Carts extends CRUD {
    constructor() {
        super('email', 'carts')
    }

    /**
     * Create an item in the cart
     *
     * @param {Object} params - cart params
     * @returns {Promise<Array<ICartItem>>}
     */
    create(params) {
        return super.findOne(params.email)
            .then((response) => {
                if (!response) {
                    return this.db.create(params.email, [])
                        .then(() => {
                            return [];
                        });
                }

                return response;
            })
            .then((response) => {
                const result = Object.assign({}, params);

                delete result.email;

                response.push(result);

                return super.update(params.email, response);
            });
    }

    /**
     * Update item of the cart
     *
     * @param {String} id - user identity
     * @param {Object} params - cart object
     * @returns {Promise<Array<ICartItem>>}
     */
    update(id, params) {
        return super.findOne(id)
            .then((response) => {
                const index = helpers.findIndex(response, {
                    id: params.id
                });

                response[index] = params;

                return super.update(id, response);
            });
    }

    /**
     * Delete item from user's cart
     *
     * @param {String} key - user identity
     * @param {String} id - cart item identity
     * @returns {Promise<Array<ICartItem>>}
     */
    delete(key, id) {
        return super.findOne(key)
            .then((response) => {
                const index = helpers.findIndex(response, {
                    id
                });

                if (index !== -1) {
                    response.splice(index, 1);
                }

                return super.update(key, response);
            });
    }

    /**
     * Clear user's cart
     *
     * @param {String} id - user identity
     * @returns {Promise<*>}
     */
    empty(id) {
        return super.delete(id);
    }
}

module.exports = new Carts();
