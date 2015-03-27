import path from 'path';
import url from 'url';

export default function urlJoin(...parts) {
	let base = url.parse(parts.shift());

	parts.unshift(base.pathname);
	base.pathname = path.join(path, ...parts.map(i=> !i ? '': i.toString()));

	return base.format();
}
