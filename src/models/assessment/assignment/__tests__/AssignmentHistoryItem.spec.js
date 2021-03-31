/* eslint-env jest */
import Logger from '@nti/util-logger';

import MockServiceBase from '../../../__test__/mock-service.js';
import AssignmentHistoryItem from '../AssignmentHistoryItem.js';
// Since the AssignmentHistoryItem is a composite model, we import dependent models:
import '../AssignmentFeedbackContainer.js';
import '../AssignmentHistoryItemContainer.js';
import '../MetadataAttemptItem.js';
import '../AssignmentSubmission.js';
import '../../QuestionSetSubmission.js';
import '../../QuestionSubmission.js';
import '../../../courses/Grade.js';

import data from './AssignmentHistoryItem.json';

describe('AssignmentHistoryItem Model', () => {
	test('Parses', async () => {
		const MockService = {
			...MockServiceBase,
			get: async () => ({ Title: 'Mock Course' }),
			getObjectRaw: async () => ({ title: 'Mock Assignment' }),
			getObject: async () => ({ title: 'Mock Assignment' }),
		};

		const logger = Logger.get('InstanceCacheable');
		jest.spyOn(logger, 'warn').mockImplementation(() => {});

		const item = new AssignmentHistoryItem(MockService, null, data);

		expect(logger.warn).toHaveBeenCalledWith(
			expect.stringMatching(/Rogue Instance/i),
			expect.anything(),
			item
		);
		expect(item).toBeTruthy();
		await item.waitForPending();

		//TODO: assert values after "pending"
	});
});
