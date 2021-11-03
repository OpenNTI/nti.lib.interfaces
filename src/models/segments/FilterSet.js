import { mixin as Fields } from '../../mixins/Fields.js';

export class FilterSet extends Fields() {
	// prettier-ignore
	static Fields = {
		'filter_sets': { type: 'model[]' }
	};

	constructor(service, parent, data) {
		super(service, parent, data);
	}
}
