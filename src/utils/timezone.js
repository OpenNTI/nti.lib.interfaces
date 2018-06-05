import Logger from '@nti/util-logger';

const logger = Logger.get('interfaces:utils:timezone');

export function setTimezoneCookie (data, name = 'timezone') {
	try {
		const {document} = global;
		document.cookie = `${name}=${encodeURIComponent(JSON.stringify(data))}; path=/`;
	} catch (e) {
		//
	}
}

export function getTimezoneFromCookie (name = 'timezone') {
	try {
		const {document} = global;
		const cookie = document.cookie.split(/;\s*/).find(item => item.startsWith(name + '='));
		const [,value] = cookie ? cookie.split('=') : [];
		return value && JSON.parse(decodeURIComponent(value));
	} catch (e) {
		return null;
	}
}


export function getTimezoneFromEnvironment () {
	const data = {
		offset: (new Date()).getTimezoneOffset()
	};

	try {
		data.name = Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch (e) {
		logger.warn('Could not get timezone name: %s', e.stack || e.message || e);
	}

	return data;
}


export function getTimezone (cookieName = 'timezone') {
	const tzdata = getTimezoneFromCookie(cookieName) || getTimezoneFromEnvironment();
	setTimezoneCookie(tzdata, cookieName);
	return tzdata;
}
