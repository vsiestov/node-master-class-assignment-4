const fs = require('fs');
const path = require('path');
const regExp = {
    loops: /<!-{2}\s+(?:loop:)(\w+):\s+(.*)\s+-{2}>/g,
    loop: /<!-{2}\s+(?:loop:)(\w+):\s+(.*)\s+-{2}>/,
    include: /<!(-){2}\s{0,}(include:)\s{0,}(.*)\s{0,}(-){2}>/g,
    filePath: /(?:include:)\s{0,}(.*)\s{0,}-{2}>/
};

/**
 * Read file using promise
 *
 * @param {String} filePath - file path
 * @returns {Promise<String>} - file data
 */
const readFile = (filePath) => {
    return new Promise((fullFill, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }

            return fullFill(data);
        });
    });
};

const replaceObject = (template, data) => {
    for (const item in data) {

        if (data.hasOwnProperty(item)) {
            template = template.replace(new RegExp(`{{\\s{0,}(${item})\\s{0,}}}`, 'g'), data[item])
        }

    }

    return template
};

/**
 * Fill template with data
 *
 * @param {String} root - root view folder
 * @param {String} template - page string
 * @param {Object} data - page data
 * @returns {Promise<String>}
 */
const replaceData = (root, template, data) => {
    return new Promise((fullFill, reject) => {
        template = replaceObject(template, data);

        const loops = template.match(regExp.loops) || [];

        Promise.all(loops.map((loop) => {
            const matches = loop.match(regExp.loop);
            const variable = matches[1];
            const includeTemplate = matches[2];
            const list = data[variable];

            if (!list || !(list instanceof Array) || !includeTemplate) {
                return Promise.resolve('');
            }

            return readFile(path.join(root, '/', includeTemplate))
                .then((loopTemplate) => {
                    const count = list.length;
                    const result = [];

                    for (let i = 0; i < count; i++) {
                        result.push(replaceObject(loopTemplate, list[i]));
                    }

                    return result.join('');
                });
        }))
            .then((loopsContent) => {
                const loopsCount = loops.length;

                for (let i = 0; i < loopsCount; i++) {
                    template = template.replace(loops[i], loopsContent[i]);
                }

                return template;
            })
            .then((template) => {
                return fullFill(template);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

/**
 * Search includes in template and concat them
 *
 * @param {String} root - root view/template folder
 * @param {String} template - template string
 * @returns {Promise<String>} - result template string
 */
const includes = (root, template) => {
    const filePathRegExp = regExp.filePath;
    const list = template.match(regExp.include);

    return Promise.all(list.map((include) => {
        return readFile(path.join(root, '/', include.match(filePathRegExp)[1].trim()))
            .then((response) => {
                template = template.replace(include, response);
            });
    }))
        .then(() => {
            return template;
        })
};

/**
 * Render data on the template
 *
 * @param {String} root - root folder
 * @param {String} filePath - file path
 * @param {String} data - data to render
 * @returns {Promise<String>}
 */
const render = (root, filePath, data) => {
    return readFile(`${root}/${filePath}`)
        .then((response) => {
            return includes(root, response);
        })
        .then((response) => {
            return replaceData(root, response, data);
        });
};

module.exports = {
    render
};