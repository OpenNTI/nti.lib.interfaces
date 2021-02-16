import Base from '../Base';

export default class Integration extends Base {
	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'title':       {type: 'string'},
		'description': {type: 'string'}
	}
}
