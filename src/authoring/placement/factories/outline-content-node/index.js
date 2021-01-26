import {register} from '../registry';
import {createScopedHandlers} from '../createHandlers';

import Assignment from './Assignment';
import ContentPackage from './ContentPackage';

const ContentNodeType = 'application/vnd.nextthought.courses.courseoutlinecontentnode';
const handlers = [
	Assignment,
	ContentPackage
];

register(createScopedHandlers(ContentNodeType, handlers));
