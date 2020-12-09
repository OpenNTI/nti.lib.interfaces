import {decorate} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import {Service} from '../../../constants';
import names from '../../../mixins/CourseAndAssignmentNameResolving';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

class AssignmentFeedback extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemfeedback'

	static Fields = {
		...Base.Fields,
		'AssignmentId': { type: 'string'   },
		'body':         { type: '*[]'      },
		'title':        { type: 'string'   }
	}

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	async delete () {
		let link = this.getLink('edit');
		if (!link) {
			throw new Error('No Edit Link');
		}

		return this[Service].delete(link);
	}


	async editBody (body) {
		let link = this.getLink('edit');
		if (!link) {
			throw new Error('No Edit Link');
		}

		this.body = body;

		return this[Service].put(link, this.getData());
	}

}

export default decorate(AssignmentFeedback, {with:[
	model,
	mixin(names),
]});
