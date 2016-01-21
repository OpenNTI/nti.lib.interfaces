import isEmpty from 'isempty';

export default function ensureIterable (a) {
	return a[Symbol.iterator] ? a :
		(isEmpty(a, true) ? [] : [a]);
}
