const hits = {};

export default function (instance, maxCount) {
	let key = instance.constructor.toString();
	let c = hits[key] = (hits[key] || 0) + 1;

	if (c >= maxCount) {
		throw new Error('Instance tracked more times than allowed.');
	}
}
