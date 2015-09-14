import isEmpty from 'fbjs/lib/isEmpty';

export default function ensureArray (a) {
	return Array.isArray(a) ? a :
		(isEmpty(a, true) ? [] : [a]);
}
