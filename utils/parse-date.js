export default function parseDate(value) {
	if (!value) {
		return null;
	}

	if (typeof value === 'number') {
		value = Math.floor(value * 1000);
	}

	let date = new Date(value);
	//if not equal to the input...
	//toISOString includes millies, drop the millies
	if (typeof value === 'string' && date.toISOString().replace(/\.\d+/, '') !== value) {
		throw new Error('Bad Date String Parse: '+ value);
	}
	else if (typeof value === 'number' && date.getTime() !== value) {
		throw new Error('Bad Date Stamp Parse');
	}

	return date;
}
