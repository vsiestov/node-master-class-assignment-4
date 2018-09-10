const config = require('../config/config');
const crypto = require('crypto');

/**
 * Generate hash for input string
 *
 * @param {String} str
 * @returns {*}
 */
const hash = (str) => {
    if (typeof str === 'string' && str) {
        return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    }

    return false;
};

/**
 * Generate random stirng
 *
 * @param {Number} strLength
 * @returns {*}
 */
const randomString = (strLength) => {
    strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;

    if (strLength) {
        const possbileCharacters = 'abcdefghijklmopqrstuvwxyz0123456789';
        const result = [];

        for (let i = 1; i < strLength; i++) {
            const randomCharacter = possbileCharacters.charAt(Math.floor(Math.random() * possbileCharacters.length));

            result.push(randomCharacter);
        }

        return result.join('');
    }

    return false;
};

/**
 * Checking if current user is admin
 *
 * @param {Object} req - node request object
 * @param {Object} res - node response object
 * @param {Function} next - callback function
 * @returns {*|boolean|number|void}
 */
const isAdmin = (req, res, next) => {
    const user = req.user;

    if (!user.admin) {
        return res.send({
            errors: [
                'Only admin can access to this resource'
            ]
        })
    }

    next();
};

/**
 * Find an item index by key in the array
 *
 * @param {Array<Object>} list - list of objects
 * @param {Object} obj - query object
 * @returns {number} - index of searching item
 */
const findIndex = (list, obj) => {
    const count = list.length;

    for (let i = 0; i < count; i++) {
        for (const item in obj) {

            if (obj.hasOwnProperty(item)) {
                if (list[i][item] === obj[item]) {
                    return i;
                }
            }

        }
    }

    return -1;
};

module.exports = {
    hash,
    randomString,
    isAdmin,
    findIndex
};