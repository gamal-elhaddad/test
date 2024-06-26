const { NODE_ENV } = require('../../config/env');
const { CustomError } = require('./error.handler');

class ResponseBody {
	constructor(data, msgDev, msgProd) {
		if (!data && !msgDev) {
			throw new CustomError(
				500,
				50000,
				'cannot create empty responseBody object',
			);
		}
		!!msgDev &&
			(this.msg = { dev: msgDev, prod: msgProd ? msgProd : msgDev });
		this.data = data;
	}
}

const responseHandler = (res, status, responseBody) => {
	if (responseBody) {
		if (responseBody.msg) {
			if (NODE_ENV === 'dev') {
				responseBody.msg = responseBody.msg.dev;
			} else {
				responseBody.msg = responseBody.msg.prod
					? responseBody.msg.prod
					: responseBody.msg.dev;
			}
		}
	} else {
		responseBody = {};
	}

	responseBody.status = status;

	return res.status(status).json(responseBody);
};

module.exports = { ResponseBody, responseHandler };
