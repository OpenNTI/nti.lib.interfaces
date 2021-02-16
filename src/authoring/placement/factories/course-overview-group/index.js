import { register } from '../registry';
import { createScopedHandlers } from '../createHandlers';

import Assignment from './Assignment';
import ContentPackage from './ContentPackage';

const OverviewGroup = 'application/vnd.nextthought.nticourseoverviewgroup';
const handlers = [Assignment, ContentPackage];

register(createScopedHandlers(OverviewGroup, handlers));
