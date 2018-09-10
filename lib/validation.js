

/**
 * Check input value if it is higher then "min" variable
 *
 * @param {Number} min - minimal value
 * @param {Number|String} value - input value
 * @returns {boolean} - Result of comparision
 */
const min = (min, value) => {
    const type = typeof value;

    if (type === 'number') {
        return value >= min;
    } else if (type === 'string') {
        return value.length >= min;
    } else {
        return false;
    }
};

/**
 * Check input value if it is less then "max" variable
 * @param {Number} max - maximum value
 * @param {Number|String} value - input value
 * @returns {boolean} - Result of comparision
 */
const max = (max, value) => {
    const type = typeof value;

    if (type === 'number') {
        return value <= max;
    } else if (type === 'string') {
        return value.length <= max;
    } else {
        return false;
    }
};

/**
 * Check validation of input data
 *
 * @param {String} field - name of a field
 * @param {Object} configProperty - Configuration object
 * @param {Object} data - input object
 * @returns {String|Boolean} - Result of validation. Can return message or boolean value
 */
const isInvalid = (field, configProperty, data) => {

    const dataProperty = data[field];
    const invalidMessage = `The field "${field}" is invalid`;

    if (!data.hasOwnProperty(field) && configProperty.required) {
        return configProperty.message || `The field "${field}" is required`;
    }

    if (!data.hasOwnProperty(field)) {
        return false;
    }

    if (configProperty.type && typeof dataProperty !== configProperty.type) {
        return configProperty.message || invalidMessage;
    }

    if (configProperty.match &&
        configProperty.match instanceof RegExp &&
        !configProperty.match.test(dataProperty)
    ) {
        return configProperty.message || invalidMessage;
    }

    if (configProperty.hasOwnProperty('min') && !min(configProperty.min, dataProperty)) {
        return configProperty.message || invalidMessage;
    }

    if (configProperty.hasOwnProperty('max') && !max(configProperty.max, dataProperty)) {
        return configProperty.message || invalidMessage;
    }

    return false;
};

/**
 * Validate input parameters
 *
 * @param {Object} params - validation schema
 * @returns {Function} - middleware function
 */
const validationMiddleware = (params) => {
    return (req, res, next) => {
        const method = req.method;
        const data = method === 'post' || method === 'put' || method === 'patch' ?
            req.body :
            {
                ...req.query
            };

        const result = [];

        for (const item in params) {

            if (params.hasOwnProperty(item)) {
                result.push(isInvalid(item, params[item], data));
            }

        }

        req.errors = result.filter((item) => {
            return item;
        });

        next();
    };
};

module.exports = validationMiddleware;
