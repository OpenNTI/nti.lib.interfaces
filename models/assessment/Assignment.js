import Base from '../Base';
import {
	Service,
	ReParent,
	DateFields,
	Parser as parse
} from '../../CommonSymbols';
import parseDate from '../../utils/parse-date';

const RENAME = Symbol.for('TakeOver');

const isNewer = (x, i) => parseDate(x['Last Modified']) > i.getLastModified();

const ActiveSavePointPost = Symbol('ActiveSavePointPost');

export default class Assignment extends Base {
	static parse (service, parent, data) {
		const map = this.instances = (this.instances || {});
		const {NTIID: id} = data;

		//#smh
		//When Assessment Parts parse, they look to the parent for the
		//content root to fill in the "relative" URLs to assets they link to :/
		//Content from the server referencing Images or any other assets should be absolute.
		//But...they're not. #fml
		parent = parent.getContentRoot ? parent : null;

		let inst = map[id];
		if (!inst) {
			inst = map[id] = new Assignment(service, parent, data);
		}

		//Refresh if:
		//newer data
		else if (isNewer(data, inst)
			//or has a proper parent. (see gripe above)
			|| (parent && !inst.parent())) {

			if (parent && inst.parent() !== parent) {
				inst[ReParent](parent);
			}

			inst.refresh(data);
		}

		return inst;
	}

	constructor (service, parent, data) {
		super(service, parent, data, {isSubmittable: true});

		this[parse]('parts', []);

		this[RENAME]('GradeAssignmentSubmittedCount', 'submittedCount'); //number of submissions with grades?
		//this[RENAME]('GradeSubmittedCount', 'gradeCount'); // just number of grades?
	}

	[DateFields] () {
		return super[DateFields]().concat([
			'available_for_submission_beginning',//becomes getAvailableForSubmissionBeginning
			'available_for_submission_ending'//becomes getAvailableForSubmissionEnding
		]);
	}


	/**
	 * Checks to see if the NTIID is within this Assignment (Checking the QuestionSet's id and all questions id's)
	 *
	 * @param {string} id NTIID
	 * @returns {boolean} true if the id was found, false otherwise.
	 */
	containsId (id) {
		return this.parts.filter(p => p && p.containsId(id)).length > 0;
	}


	isNonSubmit () {
		let p = this.parts;

		if (this.hasOwnProperty('NoSubmit')) {
			return this.NoSubmit;
		}

		if (this.hasOwnProperty('no_submit')) {
			return this.no_submit;
		}

		return !p || p.length === 0 || /no_submit/.test(this.category_name);
	}


	canBeSubmitted () {
		return !this.isNonSubmit();
	}


	isLate (date) {
		return date > this.getDueDate();
	}


	getDueDate () {
		return this.getAvailableForSubmissionEnding();
	}


	getQuestion (id) {
		return this.parts.reduce((question, part) =>
			question || part.getQuestion(id), null);
	}


	getQuestions () {
		this.parts.reduce((list, part) =>
			list.concat(part.getQuestions()), []);
	}


	getQuestionCount () {
		return this.parts.reduce((agg, part) =>
			agg + part.getQuestionCount(), 0);
	}


	getSubmission () {
		let Model = this.getModel('assessment.assignmentsubmission');
		let s = new Model(this[Service], this, {
			assignmentId: this.getID(),
			parts: []
		});

		s.parts = this.parts.map(p => {
			p = p.getSubmission();
			p[ReParent](s);
			return p;
		});

		return s;
	}


	loadPreviousSubmission () {
		return this.loadHistory()
			.catch(() => this.loadSavePoint());
	}


	loadHistory () {
		return this.fetchLinkParsed('History');
	}


	loadSavePoint () {
		return this.fetchLinkParsed('Savepoint');
	}


	postSavePoint (data) {
		if (!this.hasLink('Savepoint')) {
			return Promise.resolve({});
		}

		let last = this[ActiveSavePointPost];
		if (last && last.abort) {
			last.abort();
		}

		let result = this[ActiveSavePointPost] = this.postToLink('Savepoint', data);

		result.catch(()=> {}).then(()=> {
			if (result === this[ActiveSavePointPost]) {
				delete this[ActiveSavePointPost];
			}
		});

		return result;
	}

}
