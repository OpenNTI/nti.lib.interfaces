import {mixin} from 'nti-lib-decorators';

import {Service} from '../../../constants';
import names from '../../../mixins/CourseAndAssignmentNameResolving';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

export default
@model
@mixin(names)
class AssignmentFeedback extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemfeedback'

	static Fields = {
		...Base.Fields,
		'AssignmentId': { type: 'string'   },
		'body':         { type: 'string[]' }
	}

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	delete () {
		let link = this.getLink('edit');
		if (!link) {
			return Promise.reject(new Error('No Edit Link'));
		}

		return this[Service].delete(link);
	}


	editBody (body) {
		let link = this.getLink('edit');
		if (!link) {
			return Promise.reject(new Error('No Edit Link'));
		}

		this.body = body;

		return this[Service].put(link, this.getData());
	}

}
