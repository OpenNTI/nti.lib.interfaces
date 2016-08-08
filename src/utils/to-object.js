export default function toObject (thing) {
	const out = {};
	if (!thing[Symbol.iterator]) {
		if (thing.forEach) {
			thing.forEach((v, key) => out[key] = v);
		}
		else {
			Object.keys(thing).map(k => out[k] = thing[k]);
		}
	}
	else {
		for (let e of thing) {
			const [key, value] = e;
			out[key] = value;
		}
	}
	return out;
}
