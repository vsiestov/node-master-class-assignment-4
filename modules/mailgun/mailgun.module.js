const request = require('../../lib/request');
const config = require('../../config/config');
const mailgunUrl = `https://api.mailgun.net/v3/${config.mailgunDomain}/messages`;

const mailgun = {

    /**
     * Send an email message
     *
     * @param {String} to - destination
     * @param {String} subject - email subject
     * @param {String} text - email content
     */
    send: (to, subject, text) => {
        return request({
            url: mailgunUrl,
            from: config.mailgunFrom,
            method: 'post',
            body: {
                from: config.mailgunFrom,
                to,
                subject,
                text
            },
            auth: `api:${config.mailgunApi}`
        });
    }
};


module.exports = mailgun;
