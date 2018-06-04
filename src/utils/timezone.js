import Logger from '@nti/util-logger';

const logger = Logger.get('interfaces:utils:timezone');
const {document} = global;

export function setTimezoneCookie (data, name = 'timezone') {
	document.cookie = `${name}=${encodeURIComponent(JSON.strings(data))}; path=/`;
}

export function getTimezoneFromCookie (name = 'timezone') {
	const cookie = document.cookie.split(/;\s*/).find(item => item.startsWith(name + '='));
	const [,value] = cookie ? cookie.split('=') : [];
	return value && JSON.parse(value);
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
