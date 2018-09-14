const readline = require('readline');
const Events = require('events');
const events = new Events();
const pizzas = require('../pizzas/pizzas.module');
const orders = require('../orders/orders.module');
const users = require('../users/users.module');

const options = [
    'man',
    'help',
    'exit',
    'menu',
    'recent orders',
    'order detail',
    'users',
    'user'
];

const optionsDescription = {
    'man': 'Show help',
    'exit': 'Stop this CLI and the pizza delivery app',
    'menu': 'View all current menu items',
    'recent orders': 'View all the recent orders in the system (orders placed in the last 24 hours)',
    'order detail --{orderId}': 'Lookup the details of a specific order by order ID',
    'users': 'View all the users who have signed up in the last 24 hours',
    'user --{email}': 'Lookup the details of a specific user by email address'
};

const cliInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>> '
});

const ui = {

    /**
     * Draw horizontal line to console
     */
    line: () => {
        const width = process.stdout.columns;
        const line = [];

        for (let i = 0; i < width; i++) {
            line.push('-')
        }

        console.log(line.join(''));
    },

    /**
     * Draw empty line(s)
     * @param lines
     */
    space: (lines = 1) => {
        for (let i = 0; i < lines; i++) {
            console.log('');
        }
    },

    /**
     * Render text to console with ability to align to left/center/right
     *
     * @param {String} message
     * @param {String} [orientation] - can accept params (left, center, right)
     */
    text: (message, orientation = 'left') => {
        const width = process.stdout.columns;
        const line = [];
        let padding;

        switch (orientation) {
        case 'center':
            padding = Math.floor((width - message.length) / 2);

            for (let i = 0; i < padding; i++) {
                line.push(' ');
            }

            break;

        case 'right':
            padding = width - message.length;

            for (let i = 0; i < padding; i++) {
                line.push(' ');
            }

            break;
        }

        line.push(message);

        console.log(line.join(''));
    },

    /**
     * Render header with lines and text
     * @param message
     * @param orientation
     */
    header: (message, orientation) => {
        ui.line();
        ui.text(message, orientation);
        ui.line();
    },

    /**
     * Prepare value for a cell. If input value is larger then maxLen, it will be cut
     *
     * @param {String} value - cell value
     * @param {Number} maxLen - max length of a table cell
     * @returns {string}
     */
    prepareValue: (value, maxLen) => {
        const str = typeof value === 'string' ? value : value.toString();

        if (str.length > maxLen) {
            return `${str.substr(0, maxLen - 3)}...`;
        }

        return str;
    },

    /**
     * Print object into a row
     *
     * @param {Object} obj
     */
    print: (obj) => {
        const result = [];
        const keys = Object.keys(obj);
        const lineWidth = Math.floor(process.stdout.columns / keys.length) - 2;

        for (const item in obj) {

            if (obj.hasOwnProperty(item)) {
                const value = ui.prepareValue(obj[item], lineWidth);
                const spaces = lineWidth - value.length;

                result.push(value);
                result.push(...new Array(spaces).fill(' '));
                result.push('| ');
            }

        }

        console.log(result.join(''));
    },

    /**
     * Render array of objects as a table
     *
     * @param {Array<Object>} list
     */
    table: (list) => {
        if (!list.length) {
            return;
        }

        const tableHead = list[0];
        const head = {
        };

        for (const th in tableHead) {

            if (tableHead.hasOwnProperty(th)) {
                head[th] = th;
            }

        }

        ui.print(head);
        ui.line();

        list.forEach((item) => {
            ui.print(item);
        });

    }
};

/**
 * The list of event handlers
 *
 */
const eventHandlers = {

    /**
     * Render cli menu
     */
    help: () => {
        ui.header('Help menu', 'center');

        for (const key in optionsDescription) {
            if (optionsDescription.hasOwnProperty(key)) {
                const value = optionsDescription[key];
                const line = [];

                line.push('\x1b[34m' + key + '\x1b[0m');

                const padding = 60 - line[0].length;

                for (let i = 0; i < padding; i++) {
                    line.push(' ');
                }

                line.push(value);

                console.log(line.join(''));
                ui.line();
            }
        }

        cliInterface.prompt();
    },

    /**
     * Close the app
     */
    exit: () => {
        process.exit(0);
    },

    /**
     * Render pizza menu
     */
    menu: () => {
        pizzas.find()
            .then((response) => {
                ui.space();
                ui.header('The list of menu items');
                ui.table(response);
                ui.line();

                cliInterface.prompt();
            });
    },

    /**
     * Get the list of order in the last 24h
     */
    recentOrders: () => {
        orders.find()
            .then((response) => {
                ui.space();
                ui.header('The list of orders in the last 24 hours');
                ui.table(response
                    .filter((item) => {
                        const createdAt = new Date(item.createdAt).getTime();

                        return createdAt >= Date.now() - 24 * 60 * 60 * 1000
                    })
                    .map((item) => {
                        return {
                            id: item.id,
                            status: item.status,
                            user: item.userId
                        };
                    }));
                ui.line();

                cliInterface.prompt();
            });
    },

    /**
     * Get order details
     *
     * @param {String} cmd
     */
    orderDetail: (cmd) => {
        const params = cmd.split('--');

        if (params.length <= 1 || !params[1]) {
            return;
        }

        orders.findOne(null, params[1])
            .then((response) => {
                ui.space();
                ui.header('Details of specific order');
                console.dir(response, {
                    colors: true
                });
                ui.line();

                cliInterface.prompt();
            })
    },

    /**
     * Return the list of users that signed up in the last 24h
     */
    users: () => {
        users.find()
            .then((response) => {
                ui.space();
                ui.header('Details of specific order');
                ui.table(response
                    .filter((item) => {
                        const createdAt = new Date(item.createdAt).getTime();

                        return createdAt >= Date.now() - 24 * 60 * 60 * 1000
                    })
                    .map((item) => {
                        delete item.password;

                        return item;
                    }));
                ui.line();

                cliInterface.prompt();
            });
    },

    /**
     * Get info about specific user
     *
     * @param {String} cmd
     */
    user: (cmd) => {
        const params = cmd.split('--');

        if (params.length <= 1 || !params[1]) {
            return;
        }

        users.findOne(params[1])
            .then((response) => {
                ui.space();
                ui.header('Details of a specific user');

                delete response.password;

                console.dir(response, {
                    colors: true
                });
                ui.line();

                cliInterface.prompt();
            })
    }

};

/**
 * Listening to cli events
 */
events
    .on('man', eventHandlers.help)
    .on('help', eventHandlers.help)
    .on('exit', eventHandlers.exit)
    .on('menu', eventHandlers.menu)
    .on('recent orders', eventHandlers.recentOrders)
    .on('order detail', eventHandlers.orderDetail)
    .on('users', eventHandlers.users)
    .on('user', eventHandlers.user);

/**
 * Process input cli string
 *
 * @param {String} cmd
 */
const processInput = (cmd) => {
    let found = false;

    options.some((option) => {
        if (cmd.toLowerCase().indexOf(option) !== -1) {

            found = true;

            events.emit(option, cmd);

            return true;
        }
    });

    if (!found) {
        console.log('Undefined cli command');

        cliInterface.prompt();
    }
};

/**
 * Init cli interface
 */
const init = () => {
    console.log('\x1b[34m%s\x1b[0m', 'Welcome to Admin CLI for the pizza delivery service');

    cliInterface.prompt();

    cliInterface
        .on('line', (cmd) => {
            processInput(cmd);
        })
        .on('close', () => {
            process.exit(0);
        });
};

module.exports.init = init;