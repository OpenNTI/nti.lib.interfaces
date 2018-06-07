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
		// The inversion is not intuitive... but we're trying to make this line up with a timezone offset.
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
		// Return Value: A number representing the time-zone offset, in minutes, from the date based on CURRENT HOST system settings to UTC.
		offset: -(new Date()).getTimezoneOffset()
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
