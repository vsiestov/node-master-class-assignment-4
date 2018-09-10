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
    parser(req)
        .then((result) => {
            Object.assign(req, result);

            if (!app.router || !app.router.check(req.method, req.path)) {
                res.writeHead(404);

                return res.end('Not Found\n');
            }

            /**
             * Predefine send function for response
             *
             * @param {String|Object} data - response data
             * @param {Number} code - status code
             * @returns {boolean|*|number}
             */
            res.send = (data, code) => {
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

index('', router);
users('users', router);
orders('orders', router);
pizzas('pizzas', router);
carts('carts', router);

module.exports = app;
