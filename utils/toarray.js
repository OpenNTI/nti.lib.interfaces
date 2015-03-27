import isEmpty from './isempty';

export default function(a) {
	return isEmpty(a) ? [] :
		Array.isArray(a) ? a :
			Array.prototype.slice.call(a);
}
