import { AbstractModel } from '../AbstractModel.js';

export class FilterSet extends AbstractModel {
	// prettier-ignore
	static Fields = {
		'filter_sets': { type: 'model[]' }
	};

	constructor(service, parent, data) {
		super(service, parent, data);
	}

	get depth() {
		return (this.parent()?.depth || 0) + 1;
	}
}
