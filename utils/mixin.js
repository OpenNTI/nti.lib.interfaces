
function inPrototype (o, key) {
	let proto = Object.getPrototypeOf(o || {});
	return proto.hasOwnProperty(key);
}

export default function mixin(dest, partial) {
	for (let key of Object.keys(partial)) {
		if (dest[key] == null || !inPrototype(dest, key)) {
			dest[key] = partial[key];
		}
	}
}
