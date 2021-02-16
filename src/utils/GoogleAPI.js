export function getAPIKey(service) {
	return new Promise((done, reject) => {
		const { googleapi = {} } = service.getConfig().keys || {};
		const site = service.getSiteName();

		let key = googleapi[site] || googleapi.default;
		if (key && googleapi[key]) {
			key = googleapi[key];
		}

		if (key) {
			done(key);
		} else {
			reject('No Key');
		}
	});
}
