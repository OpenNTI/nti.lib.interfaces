/* eslint-env jest */
import Logger from '@nti/util-logger';

import MockServiceBase from '../../../__test__/mock-service';
import AssignmentHistoryItem from '../AssignmentHistoryItem';
// Since the AssignmentHistoryItem is a composite model, we import dependent models:
import '../AssignmentFeedbackContainer';
import '../AssignmentHistoryItemContainer';
import '../MetadataAttemptItem';
import '../AssignmentSubmission';
import '../../QuestionSetSubmission';
import '../../QuestionSubmission';
import '../../../courses/Grade';

import data from './AssignmentHistoryItem.json';

describe('AssignmentHistoryItem Model', () => {

	test('Parses', async () => {
		const MockService = {
			...MockServiceBase,
			get: async () => ({Title: 'Mock Course'}),
			getObjectRaw: async () => ({title: 'Mock Assignment'}),
		};

		const logger = Logger.get('InstanceCacheable');
		jest.spyOn(logger, 'warn').mockImplementation(() => {});

		const item = new AssignmentHistoryItem(MockService, null, data);

		expect(logger.warn).toHaveBeenCalledWith(expect.stringMatching(/Rogue Instance/i), expect.anything(), item);
		expect(item).toBeTruthy();
		await item.waitForPending();

		//TODO: assert values after "pending"
	});

});
