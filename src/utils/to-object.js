export default function toObject (thing) {
	const out = {};
	if (!thing[Symbol.iterator]) {
		Object.keys(thing).map(k => out[k] = thing[k]);
	}
	else {
		for (let e of thing) {
			const [key, value] = e;
			out[key] = value;
		}
	}
	return out;
}
