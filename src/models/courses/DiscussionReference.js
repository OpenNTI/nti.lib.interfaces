/*
{
	"Target-NTIID": "tag:nextthought.com,2011-10:LSTD_1153-Topic:EnrolledCourseRoot-Open_Discussions.1_1_Warmer__Elias_Hill",
	"icon": "resources/NTI1000_TestCourse/1f776a9a43573661f01c10f54e754458ebeaab6b/fd35e23767020999111e1f49239199b4c5eff23e.jpg",
	"label": "",
	"title": "1.1 Warmer: Elias Hill"
}
 */
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class DiscussionReference extends Base {
	static MimeType = COMMON_PREFIX + 'discussionref'

	constructor (service, parent, data) {
		super(service, parent, data);
	}
}
