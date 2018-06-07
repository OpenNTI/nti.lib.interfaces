/* globals spyOn */
/* eslint-env jest */
import Logger from '@nti/util-logger';

import {
	setTimezoneCookie,
	getTimezoneFromCookie,
	getTimezoneFromEnvironment,
	getTimezone
} from '../timezone';

const logger = Logger.get('interfaces:utils:timezone');

describe('TimeZone setup tools', () => {
	beforeEach(() => {
		spyOn(logger, 'warn');
		delete global.document;
	});

	test ('getTimezoneFromEnvironment() with fill Intl support', () => {
		const data = getTimezoneFromEnvironment();
		expect(logger.warn).not.toHaveBeenCalled();
		expect(data).toEqual({
			// See comment in ../timzeon.js:28
			offset: -(new Date()).getTimezoneOffset(),
			name: Intl.DateTimeFormat().resolvedOptions().timeZone
		});
	});

	test ('getTimezoneFromEnvironment() without Intl support', () => {
		global.Intl = null;
		const data = getTimezoneFromEnvironment();
		expect(logger.warn).toHaveBeenCalled();
		expect(data).toEqual({
			// See comment in ../timzeon.js:28
			offset: -(new Date()).getTimezoneOffset(),
		});
	});

	test ('getTimezoneFromEnvironment() with partial Intl support', () => {
		global.Intl = {
			DateTimeFormat: () => ({
				resolvedOptions: () => ({})
			})
		};
		const data = getTimezoneFromEnvironment();
		expect(logger.warn).not.toHaveBeenCalled();
		expect(data).toEqual({
			// See comment in ../timzeon.js:28
			offset: -(new Date()).getTimezoneOffset(),
		});
	});

	test ('getTimezoneFromCookie()', () => {
		global.document = {cookie: 'timezone=' + encodeURIComponent('{"offset":1,"name":"FooBar"}')};
		expect(getTimezoneFromCookie()).toEqual({
			offset: 1,
			name: 'FooBar'
		});
	});

	test ('getTimezoneFromCookie() bad value', () => {
		global.document = {cookie: 'timezone=asdas'};
		expect(getTimezoneFromCookie()).toEqual(null);
	});

	test ('setTimezoneCookie()', () => {
		global.document = {};
		setTimezoneCookie({test: 1});
		expect(global.document.cookie).toEqual('timezone=%7B%22test%22%3A1%7D; path=/');
	});

	test ('setTimezoneCookie() does not throw', () => {
		expect(() => setTimezoneCookie({test: 1})).not.toThrow();
	});

	test ('getTimezone()', () => {
		global.document = {};
		const o = {
			// See comment in ../timzeon.js:28
			offset: -(new Date()).getTimezoneOffset(),
			name: Intl.DateTimeFormat().resolvedOptions().timeZone
		};
		expect(getTimezone()).toEqual(o);
		expect(global.document.cookie).toEqual('timezone=' + encodeURIComponent(JSON.stringify(o)) + '; path=/');


		global.document = {cookie: 'timezone=' + encodeURIComponent('{"offset":1,"name":"FooBar"}')};
		expect(getTimezone()).toEqual({offset: 1, name: 'FooBar'});
		expect(global.document.cookie).toEqual('timezone=%7B%22offset%22%3A1%2C%22name%22%3A%22FooBar%22%7D; path=/');
	});
});
