import {register} from '../registry';
import {createHandlersFor} from '../createHandlers';

import Assignment from './Assignment';
import ContentPackage from './ContentPackage';

const ContentNodeType = 'application/vnd.nextthought.ntilessonoverview';
const handlers = [
	Assignment,
	ContentPackage
];

register(createHandlersFor(ContentNodeType, handlers));
