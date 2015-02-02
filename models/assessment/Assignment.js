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

		this.parts = (data.parts || []).map(p => this[parse](p));
	}

	[DateFields] () {
		return super[DateFields]().concat([
			'available_for_submission_beginning',
			'available_for_submission_ending'
		]);
	}


	/**
	 * Checks to see if the NTIID is within this Assignment (Checking the QuestionSet's id and all questions id's)
	 *
	 * @param {String} id NTIID
	 */
	containsId (id) {
		return this.parts.filter(p => p && p.containsId(id)).length > 0;
	}


	isNonSubmit () {
		var p = this.parts;

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
		return this.available_for_submission_ending;
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
		var s = model.build(this[Service], {
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
		var service = this[Service];
		var link = this.getLink('History');

		if (!link) {
			return Promise.reject('No Link');
		}

		return service.get(link).then(data=>this[parse](data));
	}


	loadSavePoint () {
		var service = this[Service];
		var link = this.getLink('Savepoint');

		if (!link) {
			return Promise.reject('No Link');
		}

		return service.get(link)
			.then(data=>this[parse](data));
	}


	postSavePoint (data) {
		var link = this.getLink('Savepoint');
		if (!link) {
			return Promise.resolve({});
		}

		var last = this[ActiveSavePointPost];
		if (last && last.abort) {
			last.abort();
		}

		var result = this[ActiveSavePointPost] = this[Service].post(link, data);

		result.catch(()=>{}).then(()=>{
			if (result === this[ActiveSavePointPost]) {
				delete this[ActiveSavePointPost];
			}
		});

		return result;
	}

}
