const {parse} = require('querystring');
const fs = require('fs');
const path = require('path');
const session = require('../lib/session');
const template = require('../modules/template/template.module');

const viewLocation = `${__dirname}/../views`;

/**
 *
 * @returns {{get: Function, post: Function, put: Function, patch: Function, delete: Function, process: process, check: (function(String, String): *)}}
 * @constructor
 */
const Router = () => {
    const routes = {};

    let staticDirectories;

    /**
     * Parse request cookies
     * @param {Object} request - node request object
     */
    const getCookies = (request) => {
        const cookies = {
        };

        request.headers &&
        request.headers.cookie &&
        request.headers.cookie.split(';').forEach(function(cookie) {
            const parts = cookie.match(/(.*?)=(.*)$/);
            cookies[ parts[1].trim() ] = (parts[2] || '').trim();
        });

        return cookies;
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
     * Basic mime types
     * @type {{".html": string, ".js": string, ".css": string, ".json": string, ".png": string, ".jpg": string, ".gif": string, ".wav": string, ".mp4": string, ".woff": string, ".ttf": string, ".eot": string, ".otf": string, ".svg": string}}
     */
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };

    /**
     * Serve static files
     *
     * @param {Object} req - node request object
     * @param {Object} res - node response object
     */
    const serveStatic = (req, res) => {
        const reqPath = req.path;
        const filePath = reqPath === '/' ?
            'index.html' :
            `${staticDirectories}${reqPath}`;

        const ext = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                });

                return template.render(viewLocation, 'error.html', {
                    title: 'Pizza delivery :: Error',
                    header: 'Not found',
                    message: 'Page is not found',
                    description: 'Requested page is not found'
                })
                    .then((response) => {
                        return res.end(response);
                    })
            }

            res.writeHead(200, {
                'Content-Type': contentType
            });

            return res.end(data, 'utf-8');
        });
    };

    /**
     * Processing incoming request and choose suitable method for further handler
     *
     * @param {Object} req - node request object
     * @param {Object} res - node response object
     */
    const process = (req, res) => {
        const method = req.method;

        req.cookies = getCookies(req) || {
        };

        // Create or retrieve user's session
        session.getSession(req, res)
            .catch((error) => {
                console.error('Could not get session', error);
            })
            .then(() => {

                if (method !== 'get' && !check(req.method, req.path)) {
                    res.writeHead(404);

                    return res.end('Not Found\n');
                }

                switch (method) {
                case 'get':

                    if (!check(req.method, req.path) && staticDirectories) {
                        return serveStatic(req, res);
                    }

                    break;

                case 'post':
                case 'put':
                case 'patch':

                    switch (req.headers['content-type']) {
                    case 'application/json':
                        req.body = JSON.parse(req.body);
                        break;

                    default:
                        req.body = Object.assign({}, parse(req.body));
                    }

                    break;
                }

                handlersLoop(routes[method][req.path], req, res, 0);
            })
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

    /**
     * Set static directory
     *
     * @param {String} dir
     */
    const static = (dir) => {
        staticDirectories = dir;
    };

    return {
        get: handle('get'),
        post: handle('post'),
        put: handle('put'),
        patch: handle('patch'),
        delete: handle('delete'),
        process,
        check,
        static
    };
};

module.exports = Router;
