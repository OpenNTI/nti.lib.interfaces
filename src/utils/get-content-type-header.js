export default function getContentType(headers) {
	let reg = /Content-Type/i;
	let key = Object.keys(headers).reduce(
		(i, k) => i || (reg.test(k) && k),
		null
	);

	if (key) {
		return headers[key];
	}
}
