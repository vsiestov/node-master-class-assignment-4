const fs = require('fs');
const path = require('path');
const dbDir = path.join(__dirname, '/../.data/');

class Collection {

    /**
     * Collection constructor
     *
     * @param {String} name - collection name
     * @constructor
     */
    constructor(name) {
        this.name = name;
        this.collectionDir = `${dbDir}${this.name}`;
        this.accessable = false;

        fs.access(this.collectionDir, (err) => {
            if (err) {
                return fs.mkdir(this.collectionDir, (err) => {
                    if (err) {
                        return console.log(`Could not create "${this.name}" collection directory`);
                    }

                    this.accessable = true;
                });
            }

            this.accessable = true;
        });
    }

    /**
     * Return the list of the collection records
     *
     * @returns {Promise<Array<Object>>} - the list of objects
     */
    find() {
        if (!this.accessable) {
            return Promise.reject('Could not have an access to the file system');
        }

        return new Promise((fullFill, reject) => {
            fs.readdir(this.collectionDir, (err, data) => {
                if (err) {
                    return reject(err);
                }

                return Promise.all(data.map((item) => {
                    return this.findOne(item.replace('.json', ''));
                }))
                    .then((response) => {
                        return fullFill(response);
                    })
                    .catch((error) => {
                        return reject(error);
                    });
            });
        });
    }

    /**
     * Return an object by id
     *
     * @param {String} id - record identity
     * @returns {Promise<*>} - result object
     */
    findOne(id) {
        if (!this.accessable) {
            return Promise.reject('Could not have an access to the file system');
        }

        return new Promise((fullFill, reject) => {
            fs.readFile(`${this.collectionDir}/${id}.json`, 'utf-8', (err, data) => {
                if (err) {
                    return reject(err);
                }

                return fullFill(JSON.parse(data));
            });
        });
    }

    /**
     * Create a new record in database
     *
     * @param {String} key - object key as identity
     * @param {Object} params - input object
     * @returns {Promise<Object>} - result object
     */
    create(key, params) {
        if (!this.accessable) {
            return Promise.reject('Could not have an access to the file system');
        }

        return new Promise((fullFill, reject) => {

            const fileName = `${this.collectionDir}/${params[key] || key}.json`;

            fs.open(fileName, 'wx', (err, fd) => {
                if (err) {
                    return reject(err);
                }

                return fs.write(fd, JSON.stringify(params), (err) => {
                    if (err) {
                        return reject(err);
                    }

                    return fs.close(fd, (err) => {
                        if (err) {
                            return reject(err);
                        }

                        return fullFill(params);
                    });
                })
            });
        });
    }

    /**
     * Update a record by id
     * @param {String} id - record identity
     * @param {Object} params - a new object
     * @returns {Promise<Object>} - the result object
     */
    update(id, params) {
        if (!this.accessable) {
            return Promise.reject('Could not have an access to the file system');
        }

        return new Promise((fullFill, reject) => {
            const fileName = `${this.collectionDir}/${id}.json`;

            fs.readFile(fileName, 'utf-8', (err, data) => {
                if (err) {
                    return reject(err);
                }

                const result = params instanceof Array ?
                    params :
                    Object.assign({}, JSON.parse(data), params);

                return fs.writeFile(fileName, JSON.stringify(result), (err) => {
                    if (err) {
                        return reject(err);
                    }

                    return fullFill(result);
                });
            });
        });
    }

    /**
     * Delete object by id
     *
     * @param {String} id - record identity
     * @returns {Promise<void>} - result of deleting
     */
    delete(id) {
        if (!this.accessable) {
            return Promise.reject('Could not have an access to the file system');
        }

        return new Promise((fullFill, reject) => {
            fs.unlink(`${this.collectionDir}/${id}.json`, (err) => {
                if (err) {
                    return reject(err);
                }

                return fullFill();
            });
        });
    }
}

/**
 * Provide CRUD operations for file collections
 */
class CRUD {

    /**
     * @constructor
     * @param {String} key - a kind of primary key
     * @param {String} collection - name of folder
     */
    constructor(key, collection) {
        this.key = key;
        this.db = new Collection(collection);
    }

    /**
     * Create collection item (file)
     *
     * @param {Object} params - data to save
     * @returns {Promise<Object>}
     */
    create(params) {
        params.createdAt = new Date();

        return this.db.create(this.key, params)
            .catch((error) => {
                if (error.code === 'EEXIST') {
                    return Promise.reject('The record exists and cannot be overwritten');
                }

                return Promise.reject(error);
            });
    }

    /**
     * Update collection item (file)
     *
     * @param {String} id - identity (file name)
     * @param {Object} params - data to save
     * @returns {Promise<Object>}
     */
    update(id, params) {
        return this.db.update(id, params);
    }

    /**
     * Return the list of items in the collection
     *
     * @returns {Promise<Object|Array<Object>>}
     */
    find() {
        return this.db.find();
    }

    /**
     * Return an item by id
     * @param id
     * @returns {Promise<Object|Array<Object>>}
     */
    findOne(id) {
        return this.db.findOne(id)
            .catch((error) => {
                if (error.code === 'ENOENT') {
                    return null;
                }
            });
    }

    /**
     * Delete item (file) from disk
     *
     * @param {String} id - identity (file name)
     * @returns {Promise<void>}
     */
    delete(id) {
        return this.db.delete(id);
    }
}

/**
 * Check if .data folder exists. If it is not, then create it
 */
fs.access(dbDir, (err) => {
    if (err) {
        return fs.mkdir(dbDir, (err) => {
            if (err) {
                return console.error('Could not create database directory', err);
            }

            return console.info('Database directory exists');
        });
    }

    return console.info('Database directory exists');
});

module.exports = {
    CRUD
};
