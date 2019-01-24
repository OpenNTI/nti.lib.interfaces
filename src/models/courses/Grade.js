import {pluck} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import names from '../../mixins/CourseAndAssignmentNameResolving';
import {cacheClassInstances} from '../../mixins/InstanceCacheable';
import {initPrivate, getPrivate} from '../../utils/private';
import {model, COMMON_PREFIX} from '../Registry';
//
import Base from '../Base';

const ENDS_IN_LETTER_REGEX = /\s[a-fiw-]$/i;


export default
@cacheClassInstances
@model
@mixin(names)
class Grade extends Base {
	static AllowWildDisconntectedInstances = true
	static MimeType = [
		COMMON_PREFIX + 'grade',
		COMMON_PREFIX + 'gradebook.grade',
	]

	static Fields = {
		...Base.Fields,
		'assignmentContainer': { type: 'string'  },
		'assignmentName':      { type: 'string'  },
		'AssignmentId':        { type: 'string'  },
		'Correctness':         { type: 'string'  },
		'IsExcused':           { type: 'boolean' },
		'IsPredicted':         { type: 'boolean' },
		'Username':            { type: 'string'  },
		'value':               { type: 'string?' },
		'AutoGrade':           { type: 'number'  },
		'AutoGradeMax':        { type: 'number'  },
		'CatalogEntryNTIID':   { type: 'string'  }
	}

	static deriveCacheKeyFrom (data) {
		if(!data) {
			return null;
		}

		return data.AssignmentId + '--' + data.Username;
	}


	static isEmpty (value, letter) {
		let v = `${value || ''} ${letter || ''}`;
		return v.replace('-', '').trim().length === 0;
	}


	static getPossibleGradeLetters () { return [ '-', 'A', 'B', 'C', 'D', 'F', 'I', 'W' ]; }


	constructor (service, parent, data) {
		super(service, parent, data);
		initPrivate(this);
	}


	toJSON () {
		let json = this.getData();
		json.value = [this.value, this.letter || ''].join(' ').trim();
		return json;
	}


	change (value, letter = this.letter) {

		if (letter) {
			value = [value, letter].join(' ');
		}

		return this.save({value});
	}


	get value () { return getPrivate(this).value; }

	//Models are supposed to be immutable, so this is mostly going to be called by super.refresh().
	set value (v) {
		processValue.call(this, v);
		this.onChange();
	}

	get letter () { return getPrivate(this).letter; }
	set letter (l) {
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


	isExcused () {
		return this.hasLink('unexcuse') || this.IsExcused;
	}


	isExcusable () { return this.hasLink('excuse') || this.hasLink('unexcuse'); }


	isPredicted () {
		return !!this.IsPredicted;
	}


	hasAutoGrade () {
		return !!this.AutoGrade;
	}


	excuseGrade () {
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
	 * @return {Boolean}        if they are the same values
	 */
	equals (value, letter) {
		const normalizeLetter = x => (!x || x === '-') ? false : x;
		const ltr = normalizeLetter(this.letter);
		const val = this.value;

		return ltr === normalizeLetter(letter) && val === value;
	}
}



function processValue (value) {
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
			letter: value
		});
	}
	else {
		let v = value.split(' ');

		Object.assign(getPrivate(this), {
			letter: v.length > 1 && ENDS_IN_LETTER_REGEX.test(value) ? v.pop() : null,
			value: v.join(' ')
		});
	}
}
