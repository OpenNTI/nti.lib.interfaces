import { url } from '@nti/lib-commons';

export default function forceHost(s) {
	//Force our config to always point to our server...(client side)
	let _url = url.parse(s);
	let { host, hostname, protocol, port } = global.location;
	Object.assign(_url, { host, hostname, protocol, port });

	return _url.toString();
}
