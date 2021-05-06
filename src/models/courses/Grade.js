import { decorate, pluck } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';

import names from '../../mixins/CourseAndAssignmentNameResolving.js';
import {
	cacheClassInstances,
	AfterInstanceRefresh,
} from '../../mixins/InstanceCacheable.js';
import { getPrivate } from '../../utils/private.js';
import { model, COMMON_PREFIX } from '../Registry.js';
//
import Base from '../Base.js';

const ENDS_IN_LETTER_REGEX = /\s[a-fiw-]$/i;

class Grade extends Base {
	static AllowWildDisconnectedInstances = true;
	static MimeType = [
		COMMON_PREFIX + 'grade',
		COMMON_PREFIX + 'gradebook.grade',
		COMMON_PREFIX + 'predictedgrade'
	];

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'assignmentContainer': { type: 'string'  },
		'assignmentName':      { type: 'string'  },
		'AssignmentId':        { type: 'string'  },
		'Correctness':         { type: 'string?'  },
		'IsExcused':           { type: 'boolean' },
		'IsPredicted':         { type: 'boolean' },
		'Username':            { type: 'string'  },
		'value':               { type: 'string?' },
		'AutoGrade':           { type: 'number'  },
		'AutoGradeMax':        { type: 'number'  },
		'CatalogEntryNTIID':   { type: 'string'  }
	}

	static deriveCacheKeyFrom(data) {
		if (!data) {
			return null;
		}

		return data.AssignmentId + '--' + data.Username;
	}

	static isEmpty(value, letter) {
		let v = `${value || ''} ${letter || ''}`;
		return v.replace('-', '').trim().length === 0;
	}

	static getPossibleGradeLetters() {
		return ['-', 'A', 'B', 'C', 'D', 'F', 'I', 'W'];
	}

	constructor(service, parent, data) {
		super(service, parent, data);
		processValue.call(this, data.value);
	}

	[AfterInstanceRefresh](data, old) {
		if (data.value !== old.value) {
			processValue.call(this, data.value);
		}
	}

	toJSON() {
		let json = this.getData();
		json.value = [this.value, this.letter || ''].join(' ').trim();
		return json;
	}

	change(value, letter = this.letter) {
		if (letter) {
			value = [value, letter].join(' ');
		}

		return this.save({ value }, () => {
			processValue.call(this, value);
		});
	}

	get value() {
		return getPrivate(this).value;
	}

	//Models are supposed to be immutable, so this is mostly going to be called by super.refresh().
	set value(v) {
		processValue.call(this, v);
		this.onChange();
	}

	get letter() {
		return getPrivate(this).letter;
	}
	set letter(l) {
		if (!l || l == null) {
			l = null;
		}

		l = l.toUpperCase();
		if (Grade.getPossibleGradeLetters().indexOf(l) < 0) {
			throw new Error('Illegal Value');
		}

		getPrivate(this).letter = l;
		this.onChange();
	}

	getValue() {
		return getPrivate(this).value;
	}

	getLetter() {
		return getPrivate(this).letter;
	}

	isExcused() {
		return this.hasLink('unexcuse') || this.IsExcused;
	}

	isExcusable() {
		return this.hasLink('excuse') || this.hasLink('unexcuse');
	}

	isPredicted() {
		return !!this.IsPredicted || this.Class === 'PredictedGrade';
	}

	hasAutoGrade() {
		return this.AutoGrade != null;
	}

	excuseGrade() {
		const A = 'excuse';
		const B = 'unexcuse';

		let link = this.hasLink(A) ? A : B;

		return this.postToLink(link)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links', 'IsExcused')))
			.then(() => this.onChange('excuse'));
	}

	/**
	 * looks at the values set and compares them to the ones passed
	 * treat a letter grade value of '-' the same as no letter grade
	 *
	 * @param  {string} value the value of the grade
	 * @param  {char} letter the letter value of the grade
	 * @returns {boolean}        if they are the same values
	 */
	equals(value, letter) {
		const normalizeLetter = x => (!x || x === '-' ? false : x);
		const ltr = normalizeLetter(this.letter);
		const val = this.value;

		return ltr === normalizeLetter(letter) && val === value;
	}
}

export default decorate(Grade, [cacheClassInstances, model, mixin(names)]);

function processValue(value) {
	if (typeof value === 'number') {
		let n = value.toFixed(1);
		if (n.split('.')[1] === '0') {
			n = value.toFixed(0);
		}
		value = n;
	} else if (value == null) {
		value = '';
	}

	//When the grade is a predicted value, the "value" contains just the predicted letter grade,
	//and "Correctness" contains the percentage.
	//
	//getto... we should really REALLY consider splitting value into two fields so this
	//crap doesn't confuse people... have a dedicated "letter" field and a dedicated "value"
	//field for profs to fill what ever they want...

	if (this.isPredicted()) {
		Object.assign(getPrivate(this), {
			value: this.Correctness,
			letter: value,
		});
	} else {
		let v = value.split(' ');

		Object.assign(getPrivate(this), {
			letter:
				v.length > 1 && ENDS_IN_LETTER_REGEX.test(value)
					? v.pop()
					: null,
			value: v.join(' '),
		});
	}
}
