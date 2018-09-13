const path = require('path');
const parser = require('./lib/request-parser');
const Router = require('./lib/router');

const users = require('./routes/users');
const orders = require('./routes/orders');
const pizzas = require('./routes/pizzas');
const index = require('./routes/index');
const carts = require('./routes/carts');

/**
 * Application entry point
 *
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const app = function (req, res) {

    /**
     * Predefine send function for response
     *
     * @param {String|Object} data - response data
     * @param {Number} code - status code
     * @returns {boolean|*|number}
     */
    const send = (data, code) => {
        if (typeof data === 'object') {
            res.setHeader('Content-Type', 'application/json');

            if (code) {
                res.writeHead(code);
            }

            return res.end(JSON.stringify(data));
        }

        res.setHeader('Content-Type', 'text/plain');

        if (code) {
            res.writeHead(code);
        }

        return res.end(JSON.stringify(data));
    };

    /**
     * Write cookies for server response
     * @param {Object} data - key value object
     */
    const setCookies = (data) => {
        const cookies = [];

        for (const item in data) {

            if (data.hasOwnProperty(item)) {
                cookies.push(`${item}=${data[item]}`);
            }

        }

        res.setHeader('Set-Cookie', cookies.join(';'));
    };

    /**
     * Send simple html page function
     *
     * @param {String} data - data to send
     * @param {Number} code - code to send
     */
    const sendHtml = (data, code) => {
        res.writeHead(code || 200, {
            'Content-Type': 'text/html'
        });

        res.end(data, 'utf-8');
    };

    parser(req)
        .then((result) => {
            Object.assign(req, result);

            res.send = send;
            res.sendHtml = sendHtml;
            res.setCookies = setCookies;

            return app.router.process(req, res);
        })
        .catch((error) => {

            console.error('Unknown error', error);

            res.writeHead(500);
            res.end('Something went wrong\n');
        });
};

const router = Router();

app.router = router;

router.static(path.join(__dirname, 'public'));

index('', router);
users('users', router);
orders('orders', router);
pizzas('pizzas', router);
carts('carts', router);

module.exports = app;
