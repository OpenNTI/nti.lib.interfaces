import Base from '../../Base';
import {
	DateFields,
	Parser as parse
} from '../../../CommonSymbols';

const TakeOver = Symbol.for('TakeOver');

export default class AssignmentHistoryItemSummary extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
		for(let prop of ['Grade']) {
			this[parse](prop);
		}
		const rename = (x, y) => this[TakeOver](x, y);
		rename('Grade', 'grade');

		// FeedbackCount: 0,
		// Grade
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
}
