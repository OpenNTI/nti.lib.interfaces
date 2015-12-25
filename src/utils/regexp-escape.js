
let re = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;

export default function escape (s) {
	if (typeof s !== 'string') {
		throw new TypeError('Expected a string');
	}

	return s.replace(re, '\\$&');
}
