import { register } from '../registry.js';
import { createScopedHandlers } from '../createHandlers.js';

import Assignment from './Assignment.js';
import ContentPackage from './ContentPackage.js';

const ContentNodeType =
	'application/vnd.nextthought.courses.courseoutlinecontentnode';
const handlers = [Assignment, ContentPackage];

register(createScopedHandlers(ContentNodeType, handlers));
