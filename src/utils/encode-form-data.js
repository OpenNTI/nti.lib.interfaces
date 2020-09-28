export default function encodeFormData (data) {
	try {
		return modern(data);
	} catch (e) {
		return legacy(data);
	}
}

function modern (data) {
	const f = new FormData();
	//Really do not want to add the node "form-data" polyfill...
	//form submissions should only happen on the client side.
	for (let key of Object.keys(data)) {
		f.append(key, data[key]);
	}
	return f;
}


// Node doesn't have FormData
function legacy (data) {
	let out = [];

	for (let key of Object.keys(data)) {
		const value = data[key];

		out = [...out, [key, value].map(encodeURIComponent).join('=')];
	}
	return out.join('&');
}
