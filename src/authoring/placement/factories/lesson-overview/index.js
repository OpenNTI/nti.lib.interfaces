import {register} from '../registry';
import {createHandlersFor} from '../createHandlers';

import Assignment from './Assignment';

const ContentNodeType = 'application/vnd.nextthought.ntilessonoverview';
const handlers = [
	Assignment
];

register(createHandlersFor(ContentNodeType, handlers));
