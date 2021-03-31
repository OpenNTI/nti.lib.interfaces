import { register } from '../registry.js';
import { createScopedHandlers } from '../createHandlers.js';

import Assignment from './Assignment.js';
import ContentPackage from './ContentPackage.js';

const OverviewGroup = 'application/vnd.nextthought.nticourseoverviewgroup';
const handlers = [Assignment, ContentPackage];

register(createScopedHandlers(OverviewGroup, handlers));
