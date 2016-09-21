import CourseOverviewGroup from './course-overview-group';

const PARENT_TYPES = [
	CourseOverviewGroup
];

export function placeItemInParent (item, parent, scope) {
	const type = parent.MimeType;

	for (const parentType of PARENT_TYPES) {
		if (parentType.type === type) {
			return parentType.placeItemInParent(item, parent, scope);
		}
	}

	return Promise.reject('No handler for parent');
}
