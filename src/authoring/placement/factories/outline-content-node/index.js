import {register} from '../registry';
import {createHandlersFor} from '../createHandlers';

import Assignment from './Assignment';

const ContentNodeType = 'application/vnd.nextthought.courses.courseoutlinecontentnode';
const handlers = [
	Assignment
];

register(createHandlersFor(ContentNodeType, handlers));
