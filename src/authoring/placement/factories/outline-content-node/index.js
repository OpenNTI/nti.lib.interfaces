import {createHandlersFor} from '../createHandlers';

import Assignment from './Assignment';

const ContentNodeType = 'application/vnd.nextthought.courses.courseoutlinecontentnode';
const handlers = [
	Assignment
];

export default createHandlersFor(ContentNodeType, handlers);
