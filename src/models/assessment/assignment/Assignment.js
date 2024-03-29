import PlacementProvider from '../../../authoring/placement/providers/Assignment.js';
import { Service, ASSESSMENT_HISTORY_LINK } from '../../../constants.js';
import Publishable from '../../../mixins/Publishable.js';
import Completable from '../../../mixins/Completable.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Model.js';
import SubmittableIdentity from '../mixins/SubmittableIdentity.js';
import AssignmentIdentity from '../mixins/AssignmentIdentity.js';
import { resolveSubmitTo } from '../utils.js';

import AssignmentSubmission from './AssignmentSubmission.js';

const ActiveSavePointPost = Symbol('ActiveSavePointPost');

const isSummary = ({ parts }) => parts && parts.some(x => x.IsSummary);
const getAssociationCount = x => x.LessonContainerCount;
const has = (x, k) => Object.prototype.hasOwnProperty.call(x, k);

export default class Assignment extends Completable(
	Publishable(SubmittableIdentity(AssignmentIdentity(Base)))
) {
	static MimeType = COMMON_PREFIX + 'assessment.assignment';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'auto_grade':                           { type: 'boolean', name: 'isAutoGraded'                },
		'is_non_public':                        { type: 'boolean', name: 'isNonPublic'                 },
		'available_for_submission_beginning':   { type: 'date',                                        },//becomes getAvailableForSubmissionBeginning (use getAssignedDate)
		'available_for_submission_ending':      { type: 'date',                                        },//becomes getAvailableForSubmissionEnding (use getDueDate)
		'category_name':                        { type: 'string',                                      },
		'discussion_ntiid':                     { type: 'string',  name: 'discussionId'                },
		'parts':                                { type: 'model[]', defaultValue: []                    },
		'total_points':                         { type: 'number',  name: 'totalPoints'                 },
		'version':                              { type: 'string',                                      },//a date string, ie "2017-08-20T01:23:45"
		'LessonContainerCount':                 { type: 'number',                                      },
		'GradeAssignmentSubmittedCount':        { type: 'number',  name: 'submittedCount'              },//number of submissions with grades?
		'GradeSubmittedStudentPopulationCount': { type: 'number',  name: 'submittedCountTotalPossible' },//number of people who can see it
		'GradeSubmittedCount':                  { type: 'number',  name: 'gradeCount'                  },// just number of grades?
		'IsAvailable':                          { type: 'boolean'                                      },
		'IsTimedAssignment':                    { type: 'boolean'                                      },
		'title':                                { type: 'string',                                      },
		'content':                              { type: 'string',                                      },
		'PublicationState':                     { type: 'string',                                      },
		'NoSubmit':                             { type: 'boolean',                                     },
		'Reports':                              { type: 'model[]'                                      },
		'submission_buffer':                    { type: 'number', name: 'submissionBuffer'             },
		'CurrentMetadataAttemptItem':			{ type: 'model' 									   },
		'completion_passing_percent':			{ type: 'number', name: 'passingScore'				   },
		'max_submissions':                      { type: 'number', name: 'maxSubmissions'               },
		'submission_count':                     { type: 'number', name: 'submissionCount'              },
		'HideAfterSubmission':                  { type: 'boolean'                                      },
		'UserCompletionCount':                  { type: 'number'                                       }
		// Do not add a Target-NTIID field to this model. Legacy overview models shared this mimetype but have a
		// different shape... leave those warnings in the console.
	};

	get IsSummary() {
		return isSummary(this);
	}

	ensureNotSummary() {
		return this.IsSummary ? this.refresh() : Promise.resolve(this);
	}

	shouldAutoStart() {
		return !this.IsTimedAssignment;
	}

	async start() {
		if (this.hasLink('Commence')) {
			const rawAssignment = await this.fetchLink({
				method: 'post',
				mode: 'raw',
				rel: 'Commence',
			});
			await this.refresh(rawAssignment);
		} else if (this.CurrentMetadataAttemptItem) {
			const rawAssignment =
				await this.CurrentMetadataAttemptItem.fetchLink({
					rel: 'Assignment',
					mode: 'raw',
				});
			await this.refresh(rawAssignment);
		}

		return this;
	}

	async getLatestAttempt() {
		const { CurrentMetadataAttemptItem: current } = this;

		if (current) {
			return current;
		}

		try {
			const attempts = await this.fetchLink('MetadataAttempts');

			return attempts.getLatest();
		} catch (e) {
			//swallow
			return null;
		}
	}

	/**
	 * Checks to see if the NTIID is within this Assignment (Checking the QuestionSet's id and all questions id's)
	 *
	 * @param {string} id NTIID
	 * @returns {boolean} true if the id was found, false otherwise.
	 */
	containsId(id) {
		return (this.parts || []).filter(p => p && p.containsId(id)).length > 0;
	}

	isLocked() {
		// See NTI-1414, the presence of this link signafies the assignment may be structually modified.
		return !this.hasLink('InsertPart');
	}

	isNonSubmit() {
		let p = this.parts;

		if (has(this, 'NoSubmit')) {
			return this.NoSubmit;
		}

		if (has(this, 'no_submit')) {
			return this.no_submit;
		}

		return !p || p.length === 0 || /no_submit/.test(this.category_name);
	}

	canBeSubmitted() {
		return !this.isNonSubmit();
	}

	isLate(date) {
		const due = this.getDueDate();
		return date && due && date > due;
	}

	isOutsideSubmissionBuffer() {
		const now = new Date();
		const due = this.getDueDate();
		const { submissionBuffer } = this;

		//If there is no submission buffer or due date we aren't after the submission buffer
		if ((!submissionBuffer && submissionBuffer !== 0) || !due) {
			return false;
		}

		const latest = new Date(due.getTime() + (submissionBuffer || 0) * 1000);

		return latest < now;
	}

	get hasSubmission() {
		return this.hasLink(ASSESSMENT_HISTORY_LINK);
	}

	get associationCount() {
		return getAssociationCount(this);
	}

	getDateEditingLink() {
		return this.getLink('date-edit') || this.getLink('edit');
	}

	getAssociations() {
		return this.fetchLink('Lessons');
	}

	getPlacementProvider(scope, accepts) {
		return new PlacementProvider(scope, this, accepts);
	}

	getAssignedDate() {
		return this.getAvailableForSubmissionBeginning();
	}

	getDueDate() {
		return this.getAvailableForSubmissionEnding();
	}

	getQuestion(id) {
		return (this.parts || []).reduce(
			(question, part) => question || part.getQuestion(id),
			null
		);
	}

	getQuestions() {
		return (this.parts || []).reduce(
			(list, part) => list.concat(part.getQuestions()),
			[]
		);
	}

	getQuestionCount() {
		return (this.parts || []).reduce(
			(agg, part) => agg + part.getQuestionCount(),
			0
		);
	}

	getPublishDate() {
		return this.isPublished() ? this.getAssignedDate() : null;
	}

	getSubmission() {
		const data = {
			assignmentId: this.getID(),
			version: this.version,
			parts: (this.parts || []).map(p => p.getSubmission()),
			isPracticeSubmission: this.hasLink('PracticeSubmission'),
		};

		const submitTo =
			this.getLink('PracticeSubmission') || resolveSubmitTo(this);
		const submission = new AssignmentSubmission(
			this[Service],
			this,
			data,
			submitTo
		);

		submission.parts.forEach(s => s.reparent(submission));

		return submission;
	}

	getVisibility() {
		return this.isNonPublic ? 'ForCredit' : 'Everyone';
	}

	isAvailable() {
		const now = new Date();
		const available = this.getAvailableForSubmissionBeginning();

		//If the assignment is published and the available is in the past
		return this.isPublished() && now > available;
	}

	/**
	 * Interface method. Called to load the last submission (Savepoint or final submission).
	 * Intended to be called by the assessment Store in the Mobile App when viewing an assessment.
	 *
	 * @returns {Promise} The history.
	 */
	async loadPreviousSubmission() {
		if (this.CurrentMetadataAttemptItem) {
			return this.loadSavePoint();
		}

		try {
			// you have to await async statements for catch() to work...
			// otherwise the exception makes it to the caller, and they
			// will need to try/await/catch.
			return await this.loadHistory();
		} catch {
			return this.loadSavePoint();
		}
	}

	/**
	 * Load the history directly from the Link on this object.
	 *
	 * @private
	 * @returns {Promise} The history.
	 */
	async loadHistory() {
		return this.fetchLink(ASSESSMENT_HISTORY_LINK);
	}

	async loadSavePoint() {
		const getVersion = x => ((x || {}).Submission || {}).version;

		try {
			const save = await this.fetchLink('Savepoint');

			if (getVersion(save) !== this.version) {
				//Drop savepoints that have mismatched versions
				throw new Error(
					`Version Mismatch: SavePoint(${getVersion(
						save
					)}) != Assignment(${this.version})`
				);
			}

			return save;
		} catch (e) {
			if (/No Link/.test(e.message)) {
				throw new Error('There is no save point');
			}
			throw e;
		}
	}

	async postSavePoint(data, parseResponse) {
		if (this.hasLink('PracticeSubmission')) {
			return {
				Submission: data,
				getQuestions: () =>
					data.getQuestions ? data.getQuestions() : [],
				isSyntheticSubmission: () => false,
				isSubmitted: () => false,
				isPracticeSubmission: true,
			};
		}

		if (!this.hasLink('Savepoint')) {
			return {};
		}

		const last = this[ActiveSavePointPost];
		if (last?.abort) {
			last.abort();
		}

		const result = (this[ActiveSavePointPost] = this.fetchLink({
			method: 'post',
			mode: parseResponse ? 'parse' : 'raw',
			rel: 'Savepoint',
			data,
		}));

		try {
			await result;
		} finally {
			if (result === this[ActiveSavePointPost]) {
				delete this[ActiveSavePointPost];
			}
		}

		return result;
	}

	canSetTotalPoints() {
		return this.hasLink('total-points');
	}

	setTotalPoints(points) {
		return this.save({ total_points: points }, void 0, 'total-points');
	}

	setDiscussionID(discussionId) {
		return this.save({ discussion_ntiid: discussionId });
	}

	canSetAutoGrade() {
		return this.hasLink('auto-grade');
	}

	setAutoGrade(state) {
		return this.save({ auto_grade: state }, void 0, 'auto-grade');
	}

	setSubmissionBuffer(submissionBuffer) {
		return this.save({ submission_buffer: submissionBuffer }, void 0);
	}

	canSetDueDate() {
		return this.hasLink('date-edit');
	}

	setDueDate(date) {
		return this.save(
			{ available_for_submission_ending: date },
			void 0,
			'date-edit'
		);
	}

	canSetMaxSubmissions() {
		return this.hasLink('max-submissions');
	}

	setMaxSubmissions(max) {
		return this.save({ max_submissions: max }, void 0, 'max-submissions');
	}

	/**
	 * Sets the publish state of the assignment
	 *
	 * @param {boolean|Date} state Publish States: Publish - True, Unpublish - False, or Schedule - Date
	 * @returns {Promise} Fulfills when the state is set
	 */
	setPublishState(state) {
		const isDate = state instanceof Date;
		const value = isDate ? true : !!state;

		const work =
			!isDate && !value
				? Promise.resolve()
				: this.save(
						{
							available_for_submission_beginning: isDate
								? state
								: null,
						},
						void 0,
						'date-edit'
				  );

		return work.then(() => {
			if (this.canPublish() || this.canUnpublish()) {
				return super.setPublishState(
					value,
					'available_for_submission_beginning',
					'parts',
					'IsAvailable'
				);
			}
		});
	}

	setVisibility(value) {
		return this.save({ is_non_public: value === 'ForCredit' });
	}

	/**
	 * DANGER: Resets all submissions on an assignment across all students.
	 *
	 * @returns {Promise} Promise that fulfills with request code.
	 */
	resetAllSubmissions() {
		return this.fetchLink({ method: 'post', mode: 'raw', rel: 'Reset' })
			.then(o => this.refresh(o))
			.then(() => this.onChange('all'));
	}
}

Registry.register(Assignment);
