import isEmpty from 'fbjs/lib/isEmpty';

export default function ensureIterable (a) {
	return a[Symbol.iterator] ? a :
		(isEmpty(a, true) ? [] : [a]);
}
