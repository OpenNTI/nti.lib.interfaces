import { decorate } from '@nti/lib-commons';

import { Service } from '../../../constants.js';
import { model, COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

class AssignmentFeedbackContainer extends Base {
	static MimeType =
		COMMON_PREFIX +
		'assessment.userscourseassignmenthistoryitemfeedbackcontainer';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items': { type: 'model[]' }
	}

	async addPost(body) {
		let link = this.getLink('edit');
		if (!link) {
			throw new Error('No Edit Link');
		}

		let payload = {
			MimeType:
				'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',
			Class: 'UsersCourseAssignmentHistoryItemFeedback',
			body: Array.isArray(body) ? body : [body],
		};

		return this[Service].post(link, payload);
	}

	[Symbol.iterator]() {
		let snapshot = (this.Items || []).slice();
		let { length } = snapshot;
		let index = 0;

		return {
			next() {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			},
		};
	}

	get length() {
		return (this.Items || []).length;
	}

	map(fn) {
		return (this.Items || []).map(fn);
	}
}

export default decorate(AssignmentFeedbackContainer, [model]);
