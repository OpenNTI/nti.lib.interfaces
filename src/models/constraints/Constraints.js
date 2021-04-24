import Base from '../Base.js';

export default class BaseConstraints extends Base {
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Items': {type: 'model[]'}
	}

	hasConstraintFor(itemOrId) {
		const { Items } = this;

		return Items && Items.some(item => item.hasConstraintFor(itemOrId));
	}
}
