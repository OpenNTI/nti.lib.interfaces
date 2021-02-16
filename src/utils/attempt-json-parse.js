import Logger from '@nti/util-logger';

const logger = Logger.get('lib:util:json');

export default function attemptJSONParse(value, warn) {
	try {
		return JSON.parse(value);
	} catch (e) {
		if (warn) {
			logger.warn(
				'Attempted to parse string into json but encountered an error: %s',
				e.stack || e.message
			);
		}
	}

	return value;
}
