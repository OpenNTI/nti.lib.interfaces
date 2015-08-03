import isEmpty from './isempty';

export default function ensureArray (a) {
	return Array.isArray(a) ? a :
		(isEmpty(a, true) ? [] : [a]);
}
