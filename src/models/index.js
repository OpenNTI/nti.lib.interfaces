import Registry, {COMMON_PREFIX} from './Registry';

import './annotations';
import './anchors';
import './assessment';
import './chat';
import './content';
import './courses';
import './entities';
import './forums';
import './media';
import './profile';
import './store';

import './Change';

Registry.ignore('link');

export {
	Registry,
	COMMON_PREFIX
};
