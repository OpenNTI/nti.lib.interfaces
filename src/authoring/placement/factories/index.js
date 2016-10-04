import {Handlers} from 'nti-commons';

import CourseOverviewGroup from './course-overview-group';
import OutlineContentNode from './outline-content-node';
import Assignment from './assignment';

const PARENT_TYPES = new Handlers([
	CourseOverviewGroup,
	OutlineContentNode,
	Assignment
]);

export function placeItemIn (item, container, scope) {
	const handler = PARENT_TYPES.getHandlerFor(container);

	return handler ? handler.placeItemIn(item, container, scope) : Promise.reject('No handler for container');
}


export function removeItemFrom (item, container, scope) {
	const handler = PARENT_TYPES.getHandlerFor(container);

	return handler ? handler.removeItemFrom(item, container, scope) : Promise.reject('No handler for container');
}
