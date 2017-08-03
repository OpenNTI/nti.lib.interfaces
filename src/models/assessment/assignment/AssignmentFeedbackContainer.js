import {Service, Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
class AssignmentFeedbackContainer extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemfeedbackcontainer'

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Items', []);
	}

	addPost (body) {
		let link = this.getLink('edit');
		if (!link) {
			return Promise.reject(new Error('No Edit Link'));
		}

		let payload = {
			MimeType: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',
			Class: 'UsersCourseAssignmentHistoryItemFeedback',
			body: Array.isArray(body) ? body : [body]
		};

		return this[Service].post(link, payload);
	}


	[Symbol.iterator] () {
		let snapshot = this.Items.slice();
		let {length} = snapshot;
		let index = 0;

		return {

			next () {
				let done = index >= length;
				let value = snapshot[index++];

				return { value, done };
			}

		};
	}

	get length () {
		return this.Items.length;
	}

	map (fn) {
		return this.Items.map(fn);
	}
}
