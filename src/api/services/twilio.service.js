const twilio = require('twilio');
const {
	TWILIO_SID,
	TWILIO_AUTH_TOKEN,
	TWILIO_SERVICE,
} = require('../../config/env');
const { TwilioError, CustomError } = require('../handlers/error.handler');
const {
	twilioVerificationStates,
	twilioVerificationChannels,
} = require('../../config/constants');
const {
	differenceBetweenDatesInMinites,
} = require('../handlers/functions.handler');
const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

const sendVerificationCode = async (
	phone,
	channel = twilioVerificationChannels.whatsapp,
) => {
	const verificationAttempts =
		await client.verify.v2.verificationAttempts.list({
			'channelData.to': phone,
			limit: 1,
		});
	const lastVerificationSid = verificationAttempts[0]?.verificationSid;
	let verification;

	if (lastVerificationSid) {
		try {
			verification = await client.verify.v2
				.services(TWILIO_SERVICE)
				.verifications(lastVerificationSid)
				.fetch();
		} catch (err) {
			//didn't find a pending verification which is fine
			// eslint-disable-next-line no-console
			console.log('not an error ', err);
		}

		if (
			verification &&
			verification.status === twilioVerificationStates.pending
		) {
			const timeDiffernce = differenceBetweenDatesInMinites(
				verification.dateCreated,
			);

			if (timeDiffernce < 2) {
				// won't happen in production
				throw new CustomError(
					401,
					40307,
					"can't resend otp, please wait 2 minutes",
				);
			} else {
				//(timeDiffernce >= 2 && timeDiffernce < 10)
				await client.verify.v2
					.services(TWILIO_SERVICE)
					.verifications(lastVerificationSid)
					.update({ status: twilioVerificationStates.canceled });
			}
		}
	}
	try {
		return await client.verify.v2
			.services(TWILIO_SERVICE)
			.verifications.create({
				to: phone,
				channel,
			});
	} catch (err) {
		throw new TwilioError(err);
	}
};

const verifyCode = async (phone, verificationCode) => {
	try {
		const verificationResult = await client.verify.v2
			.services(TWILIO_SERVICE)
			.verificationChecks.create({
				to: phone,
				code: verificationCode,
			});

		if (verificationResult.status === twilioVerificationStates.approved) {
			return verificationResult.sid;
		} else if (
			verificationResult.status === twilioVerificationStates.pending
		) {
			throw new CustomError(401, 40114, 'wrong otp, try again');
		} else {
			// canceled
			// won't happen in production
			throw new CustomError(401, 40115, 'verification canceled');
		}
	} catch (err) {
		if (err.constructor.name === 'CustomError') {
			throw err;
		}
		throw new TwilioError(err);
	}
};

module.exports = {
	sendVerificationCode,
	verifyCode,
};
