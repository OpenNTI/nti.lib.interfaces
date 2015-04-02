export const WATCH_VIDEO = 'application/vnd.nextthought.analytics.watchvideoevent';
export const RESOURCE_VIEWED = 'application/vnd.nextthought.analytics.resourceevent';
export const TOPIC_VIEWED = 'application/vnd.nextthought.analytics.topicviewevent';
export const UNKNOWN_TYPE = 'application/vnd.nextthought.analytics.unknowntype';

let types = null;

export function getTypes() {
	if (!types) {
		types = {};
		Object.keys(exports).forEach(key => {
			let mt = exports[key];
			if (typeof mt === 'string') {
				types[mt] = mt;
			}
		});
	}
	return types;
}
