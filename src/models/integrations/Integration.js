import Base from '../Model.js';

export default class Integration extends Base {
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'title':       {type: 'string'},
		'description': {type: 'string'}
	};
}
