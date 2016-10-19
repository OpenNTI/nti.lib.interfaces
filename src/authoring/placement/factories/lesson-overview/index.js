import {createHandlersFor} from '../createHandlers';

import Assignment from './Assignment';

const ContentNodeType = 'application/vnd.nextthought.ntilessonoverview';
const handlers = [
	Assignment
];

export default createHandlersFor(ContentNodeType, handlers);
