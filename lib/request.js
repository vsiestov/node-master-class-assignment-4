const http = require('http');
const https = require('https');
const url = require('url');
const qs = require('querystring');

const request = (params) => {
    return new Promise((fullFill, reject) => {
        const uri = url.parse(params.url);
        const body = qs.stringify(params.body);
        const lib = uri.protocol === 'https:' ?
            https :
            http;

        const req = lib.request({
            protocol: uri.protocol,
            hostname: uri.hostname,
            method: params.method ? params.method.toUpperCase() : 'GET',
            path: uri.path,
            auth: params.auth,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            res.setEncoding('utf8');

            const result = [];

            res.on('data', (chunk) => {
                result.push(chunk);
            });

            res.on('end', () => {
                try {
                    res.body = JSON.parse(result.join(''));
                } catch ($exception) {
                    console.log('exception', $exception, 'raw response', result);
                }

                fullFill(res);
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(body);
        req.end()
    });
};

module.exports = request;
