const MILLI = /\.\d+/;

export default function parseDate (value) {
	if (!value) {
		return null;
	}

	if (typeof value === 'number') {
		value = Math.floor(value * 1000);
	}

	let date = new Date(value);
	//if not equal to the input...
	if (typeof value === 'string') {
		let iso = date.toISOString();

		if (!MILLI.test(value)) {
			//if the input doesn't have millis, remove them form the parsed-formated output.
			iso = iso.replace(MILLI, '');
		}

		if (iso !== value) {
			throw new Error('Bad Date String Parse: ' + value);
		}
	}
	else if (typeof value === 'number' && date.getTime() !== value) {
		throw new Error('Bad Date Stamp Parse');
	}

	return date;
}
