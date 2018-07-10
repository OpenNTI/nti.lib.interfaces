import Base from '../Base';

export default
class Integration extends Base {
	static Fields = {
		...Base.Fields,
		'title':       {type: 'string'},
		'description': {type: 'string'}
	}
}
