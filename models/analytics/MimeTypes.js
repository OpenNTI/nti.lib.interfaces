export const WATCH_VIDEO = 'application/vnd.nextthought.analytics.watchvideoevent';
export const RESOURCE_VIEWED = 'application/vnd.nextthought.analytics.resourceevent';
export const TOPIC_VIEWED = 'application/vnd.nextthought.analytics.topicviewevent';
export const UNKNOWN_TYPE = 'application/vnd.nextthought.analytics.unknowntype';
export const ASSIGNMENT_VIEWED = 'application/vnd.nextthought.analytics.assignmentviewevent';
export const SELFASSESSMENT_VIEWED = 'application/vnd.nextthought.analytics.selfassessmentviewevent';

let types = null;

const TYPES = {
	ASSIGNMENT_VIEWED,
	RESOURCE_VIEWED,
	SELFASSESSMENT_VIEWED,
	TOPIC_VIEWED,
	WATCH_VIDEO,
	UNKNOWN_TYPE
};

export function getTypes() {
	if (!types) {
		types = {};
		Object.keys(TYPES).forEach(key => {
			let mt = TYPES[key];
			if (typeof mt === 'string') {
				types[mt] = mt;
			}
		});
	}
	return types;
}
