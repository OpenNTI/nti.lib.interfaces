import Base from '../Base';
import names from '../mixins/CourseAndAssignmentNameResolving';

const ENDS_IN_LETTER_REGEX = /\s[a-fiw\-]$/i;

const LETTER = Symbol('Letter');
const VALUE = Symbol('Value');

export default class Grade extends Base {
	static isEmpty (value, letter) {
		let v = `${value || ''} ${letter || ''}`;
		return v.replace('-', '').trim().length === 0;
	}


	static getPossibleGradeLetters () { return [ '-', 'A', 'B', 'C', 'D', 'F', 'I', 'W' ]; }


	constructor (service, parent, data) {
		data = Object.assign({}, data);
		let {value} = data;
		delete data.value;

		super(service, parent, data, names);

		// Correctness string
		// IsPredicted bool
		// IsExcused bool
		//
		// Username string
		// AssignmentId string
		// assignmentName string
		// assignmentContainer string

		if (value) {
			if (typeof value === 'number') {
				let n = value.toFixed(1);
				if (n.split('.')[1] === '0') {
					n = value.toFixed(0);
				}
				value = n;
			}

			//When the grade is a predicted value, the "value" contains just the predicted letter grade,
			//and "Correctness" contains the percentage.
			//
			//getto... we should really REALLY consider splitting value into two fields so this
			//crap doesn't confuse people... have a dedicated "letter" field and a dedicated "value"
			//field for profs to fill what ever they want...

			if (this.isPredicted()) {
				this[VALUE] = this.Correctness;
				this[LETTER] = value;
			}
			else {
				let v = value.split(' ');

				this[LETTER] = v.length > 1 && ENDS_IN_LETTER_REGEX.test(value) ? v.pop() : null;
				this[VALUE] = v.join(' ');
			}
		}
	}


	toJSON () {
		let json = this.getData();
		json.value = [this.value, this.letter || ''].join(' ').trim();
		return json;
	}


	get value () { return this[VALUE]; }
	set value (v) { this[VALUE] = v; }

	get letter () { return this[LETTER]; }
	set letter (l) {
		if (!l || l == null) {
			l = null;
		}

		l = l.toUpperCase();
		if (Grade.getPossibleGradeLetters().indexOf(l) < 0) {
			throw new Error('Illegal Value');
		}

		this[LETTER] = l;
	}


	isExcused () {
		return !!this.IsExcused;
	}


	isPredicted () {
		return !!this.IsPredicted;
	}
}
