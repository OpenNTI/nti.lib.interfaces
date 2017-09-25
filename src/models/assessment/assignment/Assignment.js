import {mixin} from 'nti-lib-decorators';

import PlacementProvider from '../../../authoring/placement/providers/Assignment';
import {
	Service,
	ReParent,
	ASSESSMENT_HISTORY_LINK
} from '../../../constants';
import Publishable from '../../../mixins/Publishable';
import {model, COMMON_PREFIX} from '../../Registry';
import Base from '../../Base';
import SubmittableIdentity from '../mixins/SubmittableIdentity';
import {resolveSubmitTo} from '../utils';

import AssignmentSubmission from './AssignmentSubmission';


const ActiveSavePointPost = Symbol('ActiveSavePointPost');

const isSummary = ({parts}) => parts && parts.some(x => x.IsSummary);
const getAssociationCount = (x) => x.LessonContainerCount;

export default
@model
@mixin(Publishable, SubmittableIdentity)
class Assignment extends Base {
	static MimeType = COMMON_PREFIX + 'assessment.assignment'

	static Fields = {
		...Base.Fields,
		'auto_grade':                           { type: 'boolean', name: 'isAutoGraded'                },
		'is_non_public':                        { type: 'boolean', name: 'isNonPublic'                 },
		'available_for_submission_beginning':   { type: 'date',                                        },//becomes getAvailableForSubmissionBeginning (use getAssignedDate)
		'available_for_submission_ending':      { type: 'date',                                        },//becomes getAvailableForSubmissionEnding (use getDueDate)
		'category_name':                        { type: 'string',                                      },
		'discussion_ntiid':                     { type: 'string',  name: 'discussionId'                },
		'parts':                                { type: 'model[]',                                     },
		'total_points':                         { type: 'number',  name: 'totalPoints'                 },
		'version':                              { type: 'string',                                      },//a date string, ie "2017-08-20T01:23:45"
		'LessonContainerCount':                 { type: 'number',                                      },
		'GradeAssignmentSubmittedCount':        { type: 'number',  name: 'submittedCount'              },//number of submissions with grades?
		'GradeSubmittedStudentPopulationCount': { type: 'number',  name: 'submittedCountTotalPossible' },//number of people who can see it
		'GradeSubmittedCount':                  { type: 'number',  name: 'gradeCount'                  },// just number of grades?
		'IsTimedAssignment':                    { type: 'boolean'                                      },
	}


	get IsSummary () {
		return isSummary(this);
	}


	ensureNotSummary () {
		return this.IsSummary ? this.refresh() : Promise.resolve(this);
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


	get associationCount () {
		return getAssociationCount(this);
	}


	getAssociations () {
		return this.fetchLinkParsed('Lessons');
	}


	getPlacementProvider (scope, accepts) {
		return new PlacementProvider(scope, this, accepts);
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
		const data = {
			assignmentId: this.getID(),
			version: this.version,
			parts: (this.parts || []).map(p => p.getSubmission())
		};

		const submitTo = resolveSubmitTo(this);
		const submission = new AssignmentSubmission(this[Service], this, data, submitTo);

		submission.parts.forEach(s => s[ReParent](submission));

		return submission;
	}


	getVisibility () {
		return this.isNonPublic ? 'ForCredit' : 'Everyone';
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


	canSetTotalPoints () {
		return this.hasLink('total-points');
	}


	setTotalPoints (points) {
		return this.save({'total_points': points}, void 0, 'total-points');
	}


	setDiscussionID (discussionId) {
		return this.save({'discussion_ntiid': discussionId});
	}


	canSetAutoGrade () {
		return this.hasLink('auto-grade');
	}


	setAutoGrade (state) {
		return this.save({'auto_grade': state}, void 0, 'auto-grade');
	}


	canSetDueDate () {
		return this.hasLink('date-edit');
	}


	setDueDate (date) {
		return this.save({'available_for_submission_ending': date}, void 0, 'date-edit');
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
			: this.save({ 'available_for_submission_beginning': isDate ? state : null}, void 0, 'date-edit');

		return work.then(() => {
			if (this.canPublish() || this.canUnpublish()) {
				return Publishable.setPublishState.call(this, value, 'available_for_submission_beginning', 'parts', 'IsAvailable');
			}
		});
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
