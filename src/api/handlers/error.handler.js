class CustomError extends Error {
	constructor(status, code, msgDev, msgProd) {
		super(msgDev);
		this.msg = { dev: msgDev, prod: msgProd };
		this.status = status;
		this.code = code;
	}
}

// may need some modification while developing the registeration part
class TwilioError extends CustomError {
	constructor(error) {
		super(error.status, undefined, error.message);
		this.name = 'Twilio Error';
		this.message = error.message;
		this.moreInfo = error.moreInfo;
		this.details = error.details;
		if (error.code === 60202 && error.status === 429) {
			this.msg = {
				dev: 'max check attempts reached (5), wait until the current verification expires (10 min)',
			};
			this.code = 42900;
			this.status = 429;
		} else if (error.code === 60203 && error.status === 429) {
			this.msg = {
				dev: 'max send attempts reached',
			};
			this.code = 42901;
			this.status = 429;
		} else if (error.code === 60212 && error.status === 429) {
			this.msg = {
				dev: 'too many (25) concurrent requests from the same phone number',
			};
			this.code = 42902;
			this.status = 429;
		} else if (error.code === 20003 && error.status === 401) {
			this.msg = {
				dev: 'wrong credintials provided or twilio credit has ended',
			};
			this.code = 40115;
			this.status = 401;
		} else if (error.code === 60410 && error.status === 403) {
			this.msg = {
				dev: 'phone number has been temporarily blocked by Twilio for 12 hours',
			};
			this.code = 40319;
			this.status = 403;
		} else if (error.code === 20404 && error.status === 404) {
			//will not happen in production
			this.msg = {
				dev: 'otp expired, has not been sent yet or already verified',
			};
			this.status = 404;
		} else if (error.code === 21608 && error.status === 403) {
			//will not happen in production
			this.msg = {
				dev: 'this is a free trial account from twilio only verified numbers are allowed to use it',
			};
			this.status = 403;
		} else if (error.code === 'ENOTFOUND' && !error.status) {
			//will not happen in production
			this.msg = {
				dev: 'probably, no internet',
			};
			this.status = 500;
		} else {
			this.msg = {
				dev: this.message,
			};
			this.code = error.code;
			this.status = 500;
		}
	}
}

class JwtError extends CustomError {
	constructor(status, code, msgDev, msgProd) {
		super(status, code, msgDev, msgProd);
		this.name = 'Authentication Error';
	}
}

class MulterError extends CustomError {
	constructor(status, code, msgDev, msgProd) {
		super(status, code, msgDev, msgProd);
		this.name = 'Multer Error';
	}
}

class AwsError extends CustomError {
	constructor(status, code, msgDev, msgProd) {
		super(status, code, msgDev, msgProd);
		this.name = 'Aws Error';
	}
}

module.exports = {
	CustomError,
	TwilioError,
	JwtError,
	MulterError,
	AwsError,
};
