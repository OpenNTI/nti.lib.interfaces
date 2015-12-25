import Base from '../../Base';
import {
	Service,
	Parser as parse
} from '../../../constants';


export default class AssignmentFeedbackContainer extends Base {
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


	map (fn) {
		return this.Items.map(fn);
	}
}
