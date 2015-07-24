import Base from '../Base';
import {
	Service,
	ReParent,
	DateFields,
	Parser as parse
} from '../../CommonSymbols';

const ActiveSavePointPost = Symbol('ActiveSavePointPost');

export default class Assignment extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, {isSubmittable: true});

		this[parse]('parts', []);
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
		let model = this.getModel('assessment.assignmentsubmission');
		let s = model.build(this[Service], {
			assignmentId: this.getID(),
			parts: []
		});

		s.parts = this.parts.map(function(p) {
			p = p.getSubmission();
			p[ReParent](s);
			return p;
		});

		return s;
	}


	loadPreviousSubmission () {
		return this.loadHistory()
			.catch(this.loadSavePoint.bind(this));
	}


	loadHistory () {
		let service = this[Service];
		let link = this.getLink('History');

		if (!link) {
			return Promise.reject('No Link');
		}

		return service.get(link).then(data=>this[parse](data));
	}


	loadSavePoint () {
		let service = this[Service];
		let link = this.getLink('Savepoint');

		if (!link) {
			return Promise.reject('No Link');
		}

		return service.get(link)
			.then(data=>this[parse](data));
	}


	postSavePoint (data) {
		let link = this.getLink('Savepoint');
		if (!link) {
			return Promise.resolve({});
		}

		let last = this[ActiveSavePointPost];
		if (last && last.abort) {
			last.abort();
		}

		let result = this[ActiveSavePointPost] = this[Service].post(link, data);

		result.catch(()=> {}).then(()=> {
			if (result === this[ActiveSavePointPost]) {
				delete this[ActiveSavePointPost];
			}
		});

		return result;
	}

}
