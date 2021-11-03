import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

/*
Class: "RelatedWorkRefPointer"
Containers: ["tag:nextthought.com,2011-10:NTI-CourseInfo-Alpha_Automation_Course",…]
CreatedTime: 1472498214.797947
Creator: "global.admin.alpha1"
Last Modified: 1472498214.797947
Links: []
MimeType: "application/vnd.nextthought.relatedworkrefpointer"
NTIID: "tag:nextthought.com,2011-10:NTI-NTIRelatedWorkRefPointer-UUID_3675B537AB0C61DDE358C72C358F9452"
OID: "tag:nextthought.com,2011-10:global.admin.alpha1-OID-0x087e6af9:5573657273:ufhP2NeEXGD"
href: "/dataserver2/Objects/tag%3Anextthought.com%2C2011-10%3Aglobal.admin.alpha1-OID-0x087e6af9%3A5573657273%3AufhP2NeEXGD"
target :"tag:nextthought.com,2011-10:NTI-NTIRelatedWorkRef-global_admin_alpha1_4743953516163133541_b62c3bd2"
*/

export default class RelatedWorkReferencePointer extends Base {
	static MimeType = COMMON_PREFIX + 'relatedworkrefpointer';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Containers': { type: 'string[]' },
		'target':     { type: 'string'   },
	};
}

Registry.register(RelatedWorkReferencePointer);
