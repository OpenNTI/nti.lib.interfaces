import Stream from '../../stores/Stream';
import ActivityCollator from '../../utils/activity-collator';
import { Service } from '../../constants';
import Base from '../Base';


export default class Entity extends Base {

	static Fields = {
		...Base.Fields,
		'alias':            { type: 'string' },
		'avatarURL':        { type: 'string' },
		'ID':               { type: 'string' },
		'NonI18NFirstName': { type: 'string' },
		'NonI18NLastName':  { type: 'string' },
		'realname':         { type: 'string' },
		'Username':         { type: 'string' },
	}

	static FANCY_COMPARATOR (a, b) {
		//wrapper around localeCompare, but, you cannot call localeCompare on falsy values, so check those first.
		const cmp = (A, B) => !A
		//If our left-hand-operand is falsy, the comparison is easy... and can only have 2 results.
		// (0 if the right-hand-operand is falsy, 1 otherwise - because non-falsy is greater than falsy.)
			? (!B ? 0 : 1)
			//If we have a non-falsy left-hand-operand, just call localeCompare... (it will return
			// appropriately for falsy right-hand-operands)
			: A.localeCompare(B);

		//safe accessor, if the main object is falsy, don't blow up trying to dereference the field.
		const getField = (o, f) => o ? o[f] : void 0;

		//Loop over the list of fields we want to compare. Stop as soon as we have a non-equal comparison.
		for(let field of ['NonI18NLastName', 'NonI18NFirstName', 'displayName', 'Username']) {

			let c = cmp(getField(a, field), getField(b, field));

			if (c !== 0) {
				return c;
			}
		}

		//If we get here, all is equal.
		return 0;
	}


	get displayType () {
		return 'Unknown';
	}


	get avatar () {
		return this.avatarURL;
	}


	get displayName () {
		return this.alias || this.realname || this.Username;
	}


	getActivity () {
		if (!this.hasLink('Activity')) {
			return null;
		}

		let exclude = [
			'assessment.assessedquestion',
			'bookmark',
			'redaction'
		];

		return new Stream(
			this[Service],
			this,
			this.getLink('Activity'),
			{
				exclude: exclude.map(x=> 'application/vnd.nextthought.' + x).join(','),
				sortOn: 'createdTime',
				sortOrder: 'descending',
				batchStart: 0,
				batchSize: 10
			},
			ActivityCollator
		);
	}
}

Entity.trackInstances = true;
