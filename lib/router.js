const { parse } = require('querystring');

/**
 *
 * @returns {{get: Function, post: Function, put: Function, patch: Function, delete: Function, process: process, check: (function(String, String): *)}}
 * @constructor
 */
const Router = () => {
	const routes = {
	};

    /**
     * Add a new request handler for particular method
     *
     * @param {String} method - request method (get, post, ...)
     * @returns {Function}
     */
	const handle = (method) => {
		return (path, ...handlers) => {

            if (!routes[method]) {
                routes[method] = {
                    [path]: handlers
                };
            }

			routes[method][path] = handlers;
        };
	};

    /**
     * Processing an incoming request for particular path and method
     *
     * @param {Array<Function>} handlers - the list of handlers
     * @param {Object} req - node request object
     * @param {Object} res - node response object
     * @param {Number} index - index handler that starts from 0 until the last one
     */
	const handlersLoop = (handlers, req, res, index) => {
	    const count = handlers.length;

        if (index < count && typeof handlers[index] === 'function') {
            handlers[index](req, res, () => {
                handlersLoop(handlers, req, res, index + 1);
            });
        }
    };

    /**
     * Processing incoming request and choose suitable method for further handler
     *
     * @param {Object} req - node request object
     * @param {Object} res - node response object
     */
	const process = (req, res) => {
		const method = req.method;

		switch (method) {
			case 'post':
			case 'put':
			case 'patch':

				switch (req.headers['content-type']) {
					case 'application/json':
						req.body = JSON.parse(req.body);
                        break;

					default:
						req.body = parse(req.body);
				}

				break;
		}

        handlersLoop(routes[method][req.path], req, res, 0);
	};

    /**
     * Check available method, path and handlers
     *
     * @param {String} method - http(s) method
     * @param {String} path - routing path
     * @returns {Boolean} - result of checking
     */
	const check = (method, path) => {
		return routes[method] && routes[method][path] && routes[method][path].length;
	};

	return {
		get: handle('get'),
		post: handle('post'),
		put: handle('put'),
		patch: handle('patch'),
		delete: handle('delete'),
		process,
		check
	};
};

module.exports = Router;
