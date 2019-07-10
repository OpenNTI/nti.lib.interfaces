import Base from '../Base';

export default
class BaseConstraints extends Base {
	static Fields = {
		...Base.Fields,
		'Items': {type: 'model[]'}
	}

	hasConstraintFor (itemOrId) {
		const {Items} = this;

		return Items && Items.some(item => item.hasConstraintFor(itemOrId));
	}
}