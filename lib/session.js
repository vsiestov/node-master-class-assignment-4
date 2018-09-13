/**
 * Simple implementation of the session
 */

const { randomString } = require('../lib/helpers');

const storage = {
};

/**
 * Set flash data to the session
 *
 * @param {Object} req - node request object
 * @param {Object} data - data
 */
const flash = (req, data) => {
    req.session.flash = data;
};

/**
 * Get flash messages from the session
 *
 * @param {Object} req - node request object
 * @returns {Object}
 */
const getFlash = (req) => {
    const flash = req.session.flash;

    delete req.session.flash;

    return flash;
};

/**
 * Get or create a session id for user
 *
 * @param {Object} req - node request
 * @param {Object} res - node response
 * @returns {Promise<Object>}
 */
const getSession = (req, res) => {
    return new Promise((fullFill) => {
        const cookies = req.cookies;

        const sessionId = cookies.sessionId || randomString(20);

        if (!storage[sessionId]) {
            storage[sessionId] = {
            };
        }

        res.setCookies({
            sessionId
        });

        req.session = storage[sessionId];

        req.flash = (data) => {
            flash(req, data);
        };
        req.getFlash = () => {
            return getFlash(req);
        };

        fullFill(storage[sessionId]);
    });
};

module.exports.getSession = getSession;
