import CourseOverviewGroup from './course-overview-group';

const PARENT_TYPES = [
	CourseOverviewGroup
];

export function placeItemIn (item, container, scope) {
	const type = container.MimeType;

	for (const parentType of PARENT_TYPES) {
		if (parentType.type === type) {
			return parentType.placeItemIn(item, container, scope);
		}
	}

	return Promise.reject('No handler for container');
}


export function removeItemFrom (item, container, scope) {
	const type = container.MimeType;

	for (const parentType of PARENT_TYPES) {
		if (parentType.type === type) {
			return parentType.removeItemFrom(item, container, scope);
		}
	}

	return Promise.reject('No handler for container');
}
