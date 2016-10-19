import {createHandlersFor} from '../createHandlers';

import Assignment from './Assignment';

const OverviewGroup = 'application/vnd.nextthought.nticourseoverviewgroup';
const handlers = [
	Assignment
];

export default createHandlersFor(OverviewGroup, handlers);
