export const ASSIGNMENT_VIEWED = 'application/vnd.nextthought.analytics.assignmentviewevent';
export const PROFILE_VIEWED = 'application/vnd.nextthought.analytics.profileviewevent';
export const PROFILE_ACTIVITY_VIEWED = 'application/vnd.nextthought.analytics.profileactivityviewevent';
export const PROFILE_MEMBERSHIP_VIEWED = 'application/vnd.nextthought.analytics.profilemembershipviewevent';
export const RESOURCE_VIEWED = 'application/vnd.nextthought.analytics.resourceevent';
export const SELFASSESSMENT_VIEWED = 'application/vnd.nextthought.analytics.selfassessmentviewevent';
export const TOPIC_VIEWED = 'application/vnd.nextthought.analytics.topicviewevent';
export const WATCH_VIDEO = 'application/vnd.nextthought.analytics.watchvideoevent';
export const UNKNOWN_TYPE = 'application/vnd.nextthought.analytics.unknowntype';

let types = null;

const TYPES = {
	ASSIGNMENT_VIEWED,
	PROFILE_VIEWED,
	PROFILE_ACTIVITY_VIEWED,
	PROFILE_MEMBERSHIP_VIEWED,
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
