import Url from 'url';

export default function forceHost(s) {
	//Force our config to always point to our server...(client side)
	let url = Url.parse(s);
	let {host, hostname, protocol, port} = global.location;
	Object.assign(url, {url, host, hostname, protocol, port});

	return url.format();
}
