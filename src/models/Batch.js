import Base from './Base';

export default class Batch extends Base {

	static Fields = {
		...Base.Fields,
		'Items': { type: 'model[]', defaultValue: [] }
	}
}
