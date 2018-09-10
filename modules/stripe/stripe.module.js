const request = require('../../lib/request');
const config = require('../../config/config');

const stripeUrl = 'https://api.stripe.com';
const chargesUrl = '/v1/charges';

const stripe = {
    charge: {

        /**
         * Create a charge
         *
         * @param {String} source - stripe credit cart token
         * @param {Number} amount - amount to charge
         * @param {String} description - Charge description
         */
        create: (source, amount, description) => {
            return request({
                url: `${stripeUrl}${chargesUrl}`,
                method: 'post',
                body: {
                    amount,
                    currency: 'usd',
                    source,
                    description
                },
                auth: `${config.stripeSecret}:`
            });
        },

        /**
         * Retrieve a charge by id
         *
         * @param {String} id
         */
        retrieve: (id) => {
            return request({
                url: `${stripeUrl}${chargesUrl}/${id}`,
                method: 'get',
                auth: `${config.stripeSecret}:`
            });
        }
    }
};

module.exports = stripe;
