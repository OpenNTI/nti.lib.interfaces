/* eslint-env jest */
import Grade from '../Grade';
import MockServiceBase from '../../__test__/mock-service';

import data from './grade.json';

describe('Grade Model', () => {
	test('Parses', async () => {
		const MockService = {
			...MockServiceBase,
			getObject: async () => ({ Title: 'Mock Course' }),
			getObjectRaw: async () => ({ title: 'Mock Assignment' }),
		};

		const grade = new Grade(MockService, null, {
			...data,
			value: 'some arb. value A',
		});

		await grade.waitForPending();
		expect(grade.AssignmentName).toBe('Mock Assignment');
		expect(grade.CourseName).toBe('Mock Course');

		expect(grade.value).toBe('some arb. value');
		expect(grade.letter).toBe('A');
	});
});
