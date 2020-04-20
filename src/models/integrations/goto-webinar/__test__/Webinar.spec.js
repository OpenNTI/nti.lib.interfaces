/* eslint-env jest */
import Webinar from '../Webinar';
import WebinarSession from '../WebinarSession';
import MockService from '../../../__test__/mock-service';

const buildWebinar = function (sessionTimes) {
	let webinar = new Webinar(MockService);

	webinar.times = sessionTimes.map(st => {
		let session = new WebinarSession(MockService);

		session.startTime = new Date(st[0]);
		session.endTime = new Date(st[1]);

		return session;
	});

	return webinar;
};

describe ('Webinar model test', () => {

	test('Get next session (from now)', () => {
		const now = Date.now();
		const webinar = buildWebinar([[now + 5555, now + 6666], [now + 3333, now + 4444], [now - 2222, now - 1111]]);
		const nearestSession = webinar.getNearestSession();

		expect(nearestSession.getStartTime().getTime()).toEqual(now + 3333);
	});

	test('Get current session (happening now)', () => {
		const now = Date.now();
		const webinar = buildWebinar([[now + 5555, now + 6666], [now - 3333, now + 2222], [now + 7777, now + 8888]]);
		const nearestSession = webinar.getNearestSession();

		expect(nearestSession.getStartTime().getTime()).toEqual(now - 3333);
	});

	test('Get most recent session from now since there are no upcoming sessions', () => {
		const now = Date.now();

		const webinar = buildWebinar([[now - 5555, now - 4444], [now - 4444, now - 3333], [now - 2222, now - 1111]]);
		const nearestSession = webinar.getNearestSession();

		expect(nearestSession.getStartTime().getTime()).toEqual(now - 2222);
	});

	test('Get next session (from provided time or date)', () => {
		const date = new Date('10/22/2014');
		const dateTime = date.getTime();

		const webinar = buildWebinar([[dateTime - 5555, dateTime - 4444], [dateTime - 4444, dateTime - 3333], [dateTime - 2222, dateTime - 1111]]);
		let nearestSession = webinar.getNearestSession(dateTime);

		expect(nearestSession.getStartTime().getTime()).toEqual(dateTime - 2222);

		nearestSession = webinar.getNearestSession(date);

		expect(nearestSession.getStartTime().getTime()).toEqual(dateTime - 2222);
	});

});
