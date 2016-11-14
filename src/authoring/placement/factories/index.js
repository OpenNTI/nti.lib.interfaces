import {createHandlers} from './createHandlers';

import CourseOverviewGroup from './course-overview-group';
import OutlineContentNode from './outline-content-node';
import LessonOverview from './lesson-overview';
import Assignment from './assignment';
import QuestionSet from './question-set';

const handlers = createHandlers([
	CourseOverviewGroup,
	OutlineContentNode,
	LessonOverview,
	Assignment,
	QuestionSet
]);

const refresh = (item) => item.refresh().then(() => item.onChange());

export function placeItemIn (item, container, scope) {
	return handlers.placeItemIn(item, container, scope)
		.then(() => refresh(item))//Refresh to get the newest shared counts
		.then(() => void 0);
}


export function removeItemFrom (item, container, scope) {
	return handlers.removeItemFrom(item, container, scope)
		.then(() => refresh(item))//Refresh to get the newest shared counts
		.then(() => void 0);
}