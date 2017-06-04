import {DateFields, Parser as parse} from '../../../constants';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';

const rename = Symbol.for('TakeOver');

@model
export default class AssignmentHistoryItemSummary extends Base {
	static MimeType = [
		COMMON_PREFIX + 'assessment.assignmenthistoryitemsummary',
		COMMON_PREFIX + 'assessment.userscourseassignmenthistoryitemsummary',
	]

	constructor (service, parent, data) {
		super(service, parent, data);
		for(let prop of ['Grade']) {
			this[parse](prop);
		}

		this[rename]('FeedbackCount', 'feedbackCount');
		this[rename]('Grade', 'grade');

		// Metadata:
		// { CatalogEntryNTIID: 'tag:nextthought.com,2011-10:NTI-CourseInfo-Fall2015_BIOL_2124',
		//  CreatedTime: 1445285838.886532,
		//  Creator: 'local2',
		//  Duration: 1.0493369102478027,
		//  MimeType: 'application/vnd.nextthought.assessment.userscourseassignmentmetadataitem'
		//  StartTime: 1445285838.886508 }
		// SubmissionCreatedTime
	}

	[DateFields] () {
		return super[DateFields]().concat('SubmissionCreatedTime');
	}

	get completed () {
		return this.getSubmissionCreatedTime();
	}
}
