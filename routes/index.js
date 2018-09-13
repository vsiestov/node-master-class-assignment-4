const validation = require('../lib/validation');
const users = require('../modules/users/users.module');
const tokens = require('../modules/tokens/tokens.module');
const config = require('../config/config');
const { hash } = require('../lib/helpers');
const template = require('../modules/template/template.module');
const pizzas = require('../modules/pizzas/pizzas.module');

/**
 * General list of routes.
 * Sign in/up, logout and get/update info about signed user
 *
 * @param {String} path - endpoint path
 * @param {Object} router - application router
 */

module.exports = (path, router) => {

    const viewLocation = `${__dirname}/../views`;

    /**
     * Template routers
     */

    router.get(`${path}/`, (req, res) => {
        tokens.checkToken(req)
            .then(() => {
                return pizzas.find()
                    .then((list) => {
                        return {
                            name: 'index.html',
                            list
                        };
                    });
            })
            .catch((error) => {
                console.error('Checking token caught an error', error);

                return {
                    name: 'index-logged-out.html'
                };
            })
            .then((response) => {
                template.render(viewLocation, response.name, {
                    title: 'Pizza delivery',
                    description: 'Pizza delivery description page',
                    pageHeader: 'Page header from template',
                    list: response.list
                })
                    .then((response) => {
                        res.sendHtml(response);
                    })
            });
    });

    router.get(`${path}/sign-in`, (req, res) => {
        const flash = req.getFlash();
        const errorMessage = flash && flash.errors && flash.errors.length ? flash.errors[0] : '';

        template.render(viewLocation, 'sign-in.html', {
            title: 'Pizza delivery :: Sign In',
            header: 'Sign In to your account',
            headerLink: '/sign-up',
            headerLinkLabel: 'Sign Up',
            description: 'Pizza Delivery Service authorization page',
            errors: errorMessage,
            messageVisibility: errorMessage ? 'visible' : '',
            email: flash && flash.email ? flash.email : ''
        })
            .then((response) => {
                res.sendHtml(response);
            })
    });

    router.get(`${path}/sign-up`, (req, res) => {
        const flash = req.getFlash();
        const errorMessage = flash && flash.errors && flash.errors.length ? flash.errors[0] : '';

        template.render(viewLocation, 'sign-up.html', {
            title: 'Pizza delivery :: Sign Up',
            header: 'Create a new account',
            headerLink: '/sign-in',
            headerLinkLabel: 'Sign In',
            description: 'Pizza Delivery Service authorization page',
            errors: errorMessage,
            messageVisibility: errorMessage ? 'visible' : '',
            email: flash && flash.email ? flash.email : '',
            firstName: flash && flash.firstName ? flash.firstName : '',
            lastName: flash && flash.lastName ? flash.lastName : ''
        })
            .then((response) => {
                res.sendHtml(response);
            })
    });

    router.get(`${path}/error`, (req, res) => {
        const flash = req.getFlash();
        const message = flash && flash.errors && flash.errors.length ? flash.errors[0] : '';

        template.render(viewLocation, 'error.html', {
            title: 'Pizza delivery :: Error',
            header: 'Unprocessed exception',
            message,
            description: 'Pizza Delivery Service error page'
        })
            .then((response) => {
                res.sendHtml(response);
            })
    });

    router.get(`${path}/profile`, (req, res) => {
        const flash = req.getFlash();
        const message = flash && flash.errors && flash.errors.length ? flash.errors[0] : '';

        tokens.checkToken(req)
            .then(() => {
                const user = req.user;

                return template.render(viewLocation, 'profile.html', {
                    title: 'Pizza delivery :: Profile',
                    header: 'Personal profile',
                    errors: message,
                    messageVisibility: message ? 'visible' : '',
                    description: '',
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    address: user.address || ''
                });
            })
            .then((response) => {
                res.sendHtml(response);
            })
            .catch(() => {
                res.writeHead(301, {
                    Location: '/'
                });

                return res.end();
            });
    });

    /**
     * API routers
     */

    /**
     * User can be signed up using this route /sign-up
     */
    router.post(`${path}/sign-up`, validation({
        email: {
            type: 'string',
            match: /[a-z0-9_\-+]@[a-z0-9]{2,}\.[a-z]{2,}/,
            required: true
        },
        password: {
            min: 6,
            max: 10,
            required: true
        },
        firstName: {
            required: true
        },
        lastName: {
            required: true
        }
    }), (req, res) => {
        const isHtmlForm = req.headers['content-type'] === 'application/x-www-form-urlencoded';
        const body = req.body;

        if (req.errors && req.errors.length) {

            if (isHtmlForm) {
                req.flash({
                    errors: req.errors
                });

                res.writeHead(301, {
                    Location: '/sign-up'
                });

                return res.end();
            }

            return res.send({
                errors: req.errors
            }, 422);
        }

        body.password = hash(body.password);

        return users.create(body)
            .then((response) => {
                delete response.password;

                // Create a token for newly registered user for further using

                return tokens.create({
                    email: response.email,
                    expires: Date.now() + config.tokenExpiration
                })
                    .then((token) => {

                        if (isHtmlForm) {
                            res.setCookies({
                                token: token.id
                            });

                            res.writeHead(301, {
                                Location: '/'
                            });

                            return res.end();
                        }

                        return res.send({
                            ...response,
                            ...{
                                token: token.id
                            }
                        });
                    });
            })
            .catch((error) => {

                const errors = [error];

                if (typeof error === 'string' && isHtmlForm) {

                    req.flash({
                        errors,
                        email: body.email,
                        firstName: body.firstName,
                        lastName: body.lastName
                    });

                    res.writeHead(301, {
                        Location: '/sign-up'
                    });

                    return res.end();
                }

                return res.send({
                    errors
                }, 500);
            });
    });

    /**
     * User can be signed in using this route /sign-in
     */
    router.post(`${path}/sign-in`, validation({
        email: {
            required: true
        },
        password: {
            required: true
        }
    }), (req, res) => {

        const isHtmlForm = req.headers['content-type'] === 'application/x-www-form-urlencoded';
        const body = req.body;

        if (req.errors && req.errors.length) {

            if (isHtmlForm) {
                req.flash({
                    errors: req.errors
                });

                res.writeHead(301, {
                    Location: '/sign-in'
                });

                return res.end();
            }

            return res.send({
                errors: req.errors,
                email: req.body.email
            }, 422);
        }

        users.findOne(body.email)
            .then((response) => {
                if (hash(body.password) === response.password) {

                    delete response.password;

                    // Create a token for newly registered user for further using

                    return tokens.create({
                        email: response.email,
                        expires: Date.now() + config.tokenExpiration
                    })
                        .then((token) => {

                            res.setCookies({
                                token: token.id
                            });

                            if (isHtmlForm) {
                                res.writeHead(301, {
                                    Location: '/'
                                });

                                return res.end();
                            }

                            return res.send({
                                ...response,
                                ...{
                                    token: token.id
                                }
                            });
                        });

                } else {

                    const errors = [
                        'Your password or email are not valid'
                    ];

                    if (isHtmlForm) {
                        req.flash({
                            errors,
                            email: body.email
                        });

                        res.writeHead(301, {
                            Location: '/sign-in'
                        });

                        return res.end();
                    }

                    return res.send({
                        errors
                    });
                }
            })
            .catch((error) => {

                if (isHtmlForm) {

                }

                return res.send({
                    errors: [error]
                });
            });
    });

    /**
     * User can logout using this route /logout
     */
    router.get(`${path}/logout`, tokens.verify(), (req, res) => {
        const token = req.token;

        res.setCookies({
            token: null
        });

        tokens.delete(token)
            .then(() => {
                res.writeHead(301, {
                    Location: '/'
                });
                res.end();
            })
            .catch((error) => {
                res.send({
                    errors: [error]
                }, 500);
            });
    });

    /**
     * Get info about user /me
     */
    router.get(`${path}/me`, tokens.verify(), (req, res) => {
        const user = req.user;

        delete user.password;

        res.send(user);
    });

    /**
     * User can update its own info. User can update its own info but password and email
     */
    router.post(`${path}/me`, tokens.verify(), validation({
        firstName: {
            required: true
        },
        lastName: {
            required: true
        },
        address: {
            min: 1,
            max: 100
        }
    }), (req, res) => {
        const isHtmlForm = req.headers['content-type'] === 'application/x-www-form-urlencoded';
        const body = req.body;

        if (req.errors && req.errors.length) {

            if (isHtmlForm) {
                req.flash({
                    errors: req.errors
                });

                res.writeHead(301, {
                    Location: '/profile'
                });

                return res.end();
            }

            return res.send({
                errors: req.errors
            }, 422);
        }

        const user = req.user;

        delete body.password;
        delete body.email;

        const data = {
            ...user,
            ...body
        };

        users.update(user.email, data)
            .then(() => {
                delete data.password;

                if (isHtmlForm) {
                    req.flash({
                        errors: ['Changes has been saved']
                    });

                    res.writeHead(301, {
                        Location: '/profile'
                    });

                    return res.end();
                }

                res.send(data);
            })
            .catch((error) => {
                res.send({
                    errors: [error]
                });
            });
    });
};