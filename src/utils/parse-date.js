import Logger from 'nti-util-logger';
// const MILLI = /\.\d+/;
// const ZULU = /Z$/;
// const ISODATE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?/;

const logger = Logger.get('lib:date-parsing');

export default function parseDate (value) {
	if (!value) {
		return null;
	}

	if (typeof value === 'number') {
		value = Math.floor(value * 1000);
	}

	// new Date(value) never throws... it always results in a Date object...
	// if a hard error occured, it will be "Invalid Date", getTime will return NaN.
	// if a soft error occured, it will be a normal date... so if we really care,
	// we should verify the parsed date some how. ISO date strings are easy...
	// but also very unlikely to fail in any way... :/
	// So... we should just trust the Date() parser.
	const date = new Date(value);

	if (isNaN(date.getTime())) {
		logger.error('The value %o given for date parsing resulted in an invalid date.', value);
		return null;
	}

	return date;
}
