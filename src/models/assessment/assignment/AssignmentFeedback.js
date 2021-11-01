import { Service } from '../../../constants.js';
import names from '../../../mixins/CourseAndAssignmentNameResolving.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

export default class AssignmentFeedback extends names(Base) {
	static MimeType =
		COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemfeedback';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'AssignmentId':      { type: 'string' },
		'body':              { type: '*[]'    },
		'title':             { type: 'string' },
		'SubmissionCreator': { type: 'string' }
	};

	constructor(service, parent, data) {
		super(service, parent, data);
	}

	async delete() {
		let link = this.getLink('edit');
		if (!link) {
			throw new Error('No Edit Link');
		}

		return this[Service].delete(link);
	}

	async editBody(body) {
		let link = this.getLink('edit');
		if (!link) {
			throw new Error('No Edit Link');
		}

		this.body = body;

		return this[Service].put(link, {
			// its important to use getData so that our transformers run and clean/prepare the data to send.
			body: this.getData().body,
		});
	}
}

Registry.register(AssignmentFeedback);
