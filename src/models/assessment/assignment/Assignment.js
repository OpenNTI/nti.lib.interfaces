import Base from '../../Base';
import {cacheClassInstances} from '../../mixins/InstanceCacheable';
import Publishable from '../../mixins/Publishable';
import {
	Service,
	ReParent,
	DateFields,
	Parser as parse,
	ASSESSMENT_HISTORY_LINK
} from '../../../constants';

const RENAME = Symbol.for('TakeOver');

const ActiveSavePointPost = Symbol('ActiveSavePointPost');

export default class Assignment extends Base {

	constructor (service, parent, data) {
		super(service, parent, data, Publishable, {isSubmittable: true});

		this[parse]('parts', []);

		this[RENAME]('GradeAssignmentSubmittedCount', 'submittedCount'); //number of submissions with grades?
		//this[RENAME]('GradeSubmittedCount', 'gradeCount'); // just number of grades?
		this[RENAME]('total_points', 'totalPoints');
	}


	[DateFields] () {
		return super[DateFields]().concat([
			'available_for_submission_beginning',//becomes getAvailableForSubmissionBeginning (use getAssignedDate)
			'available_for_submission_ending'//becomes getAvailableForSubmissionEnding (use getDueDate)
		]);
	}


	get isAutoGraded () {
		return this['auto_grade'];
	}


	/**
	 * Checks to see if the NTIID is within this Assignment (Checking the QuestionSet's id and all questions id's)
	 *
	 * @param {string} id NTIID
	 * @returns {boolean} true if the id was found, false otherwise.
	 */
	containsId (id) {
		return (this.parts || []).filter(p => p && p.containsId(id)).length > 0;
	}


	isLocked () {
		// See NTI-1414, the presence of this link signafies the assignment may be structually modified.
		return !this.hasLink('InsertPart');
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
		const due = this.getDueDate();
		return date && due && date > due;
	}

	get hasSubmission () {
		return this.hasLink(ASSESSMENT_HISTORY_LINK);
	}

	getAssignedDate () {
		return this.getAvailableForSubmissionBeginning();
	}


	getDueDate () {
		return this.getAvailableForSubmissionEnding();
	}


	getQuestion (id) {
		return (this.parts || []).reduce((question, part) =>
			question || part.getQuestion(id), null);
	}


	getQuestions () {
		return (this.parts || []).reduce((list, part) =>
			list.concat(part.getQuestions()), []);
	}


	getQuestionCount () {
		return (this.parts || []).reduce((agg, part) =>
			agg + part.getQuestionCount(), 0);
	}


	getPublishDate () {
		return this.isPublished() ? this.getAssignedDate() : null;
	}


	getSubmission () {
		const Model = this.getModel('assessment.assignmentsubmission');
		const data = {
			assignmentId: this.getID(),
			version: this.version,
			parts: []
		};

		const REL = 'Assessments';

		const FindCourse = (o) => o && o.isCourse && o.hasLink(REL);
		const course = this.parent(FindCourse);
		const submitTo = course && course.getLink(REL);

		const submission = new Model(this[Service], this, data, submitTo);

		submission.parts = (this.parts || []).map(p => {
			p = p.getSubmission();
			p[ReParent](submission);
			return p;
		});

		return submission;
	}


	getVisibility () {
		return this['is_non_public'] ? 'ForCredit' : 'Everyone';
	}


	isAvailable () {
		const now = new Date();
		const available = this.getAvailableForSubmissionBeginning();

		//If the assignment is published and the available is in the past
		return this.isPublished() && now > available;
	}

	/**
	 * Interface method. Called to load the last submission (Savepoint or final submission).
	 * Intended to be called by the assessment Store in the Mobile App when viewing an assessment.
	 *
	 * @return {Promise} The history.
	 */
	loadPreviousSubmission () {
		return this.loadHistory()
			.catch(() => this.loadSavePoint());
	}


	/**
	 * Load the history directly from the Link on this object.
	 *
	 * @private
	 * @return {Promise} The history.
	 */
	loadHistory () {
		return this.fetchLinkParsed(ASSESSMENT_HISTORY_LINK);
	}


	loadSavePoint () {
		const getVersion = x => ((x || {}).Submission || {}).version;
		return this.fetchLinkParsed('Savepoint')
			.then(save =>
				(getVersion(save) !== this.version)
				//Drop savepoints that have missmatched versions
					? Promise.reject(`Version Missmatch: SavePoint(${getVersion(save)}) != Assignment(${this.version})`)
					: save
				);
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


	setTotalPoints (points) {
		return this.save({'total_points': points});
	}


	setAutoGrade (state) {
		return this.save({'auto_grade': state});
	}

	/**
	 * Sets the publish state of the assignment
	 *
	 * @param {boolean|Date} state Publish States: Publish - True, Unpublish - False, or Schedule - Date
	 * @returns {Promise} Fulfills when the state is set
	 */
	setPublishState (state) {
		const isDate = state instanceof Date;
		const value = isDate ? true : !!state;

		const work = (!isDate && !value)
			? Promise.resolve()
			: this.save({ 'available_for_submission_beginning': isDate ? state : null});

		return work.then(() => Publishable.setPublishState.call(this, value, 'available_for_submission_beginning'));
	}


	setVisibility (value) {
		return this.save({'is_non_public': value === 'ForCredit'});
	}


	/**
	 * DANGER: Resets all submissions on an assignment across all students.
	 * @returns {Promise} Promise that fulfills with request code.
	 */
	resetAllSubmissions () {

		return this.postToLink('Reset')
			.then(o => this.refresh(o))
			.then(() => this.onChange('all'));
	}
}

cacheClassInstances(Assignment);
