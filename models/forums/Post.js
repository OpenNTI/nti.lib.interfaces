import Base from '../Base';

import Editable from '../mixins/Editable';
import Likable from '../mixins/Likable';

import pluck from '../../utils/pluck';

export default class Post extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, Editable, Likable);

		//body
		//title
	}
}
