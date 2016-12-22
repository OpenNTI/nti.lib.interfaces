import {register} from '../registry';
import {createHandlersFor} from '../createHandlers';

import Assignment from './Assignment';

const OverviewGroup = 'application/vnd.nextthought.nticourseoverviewgroup';
const handlers = [
	Assignment
];

register(createHandlersFor(OverviewGroup, handlers));
