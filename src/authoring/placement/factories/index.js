import {createHandlers} from './createHandlers';

import CourseOverviewGroup from './course-overview-group';
import OutlineContentNode from './outline-content-node';
import Assignment from './assignment';
import QuestionSet from './question-set';

const handlers = createHandlers([
	CourseOverviewGroup,
	OutlineContentNode,
	Assignment,
	QuestionSet
]);

export function placeItemIn (item, container, scope) {
	return handlers.placeItemIn(item, container, scope)
		.then(() => void 0);
}


export function removeItemFrom (item, container, scope) {
	return handlers.removeItemFrom(item, container, scope)
		.then(() => void 0);
}
