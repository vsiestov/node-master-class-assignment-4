const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const processRequest = (req, cb) => {
	return new Promise((fullFill) => {
		const parsedUrl = url.parse(req.url, true);

		const path = `/${parsedUrl.pathname.replace(/^\/+|\/+$/g, '')}`;
		const query = parsedUrl.query;
		const method = req.method.toLowerCase();
		const decoder = new StringDecoder('utf-8');

		const buffer = [];

		req.on('data', (data) => {
			buffer.push(decoder.write(data));
		});

		req.on('end', () => {
			buffer.push(decoder.end());

			const result = {
				path,
				query,
				method,
				body: buffer.join('')
			};

			if (typeof cb === 'function') {
				return cb(result);
			}

			return fullFill(result);
		});
	});
};

module.exports = processRequest;