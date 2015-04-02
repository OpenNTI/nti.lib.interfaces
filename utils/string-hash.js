import isEmpty from './isempty';

export default function hash(str) {
	let h = 0;
	if (isEmpty(str)) {
		return h;
	}

	for (let i = 0; i < str.length; i++) {
		let c = str.charCodeAt(i);
		/*eslint-disable no-bitwise */
		h = ((h << 5) - h) + c;
		h = h & h; // Convert to 32bit integer
		/*eslint-enable no-bitwise */
	}
	return h;
}
