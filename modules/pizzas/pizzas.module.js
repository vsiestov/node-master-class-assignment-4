const { CRUD } = require('../../lib/db');
const { randomString } = require('../../lib/helpers');

/**
 * @typedef {Object} IPizzaItem
 *
 * @property {String} id
 * @property {String} name
 * @property {String} description
 * @property {Number} count
 */

class Pizza extends CRUD {
    constructor() {
        super('id', 'pizzas')
    }

    /**
     * Create pizza item and generate id for it
     *
     * @param {Object} params - pizza object
     * @returns {Promise<IPizzaItem>} - result of creating
     */
    create(params) {
        params.id = randomString(20);

        return super.create(params);
    }
}

module.exports = new Pizza();
