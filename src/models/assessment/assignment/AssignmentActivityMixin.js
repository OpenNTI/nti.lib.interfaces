import Logger from '@nti/util-logger';

const logger = Logger.get('assignments:Activity');

export default {

	getEventConfig (type, target, date, lastSeen) {
		if (typeof target === 'string') {
			target = this.getAssignment(target);
			if (!target) {
				logger.error('Dropping event, no assignment found in the map for: %o', target);
				return null;
			}
		}

		return {
			unread: date > lastSeen,
			assignment: target,
			ntiid: target && target.getID(),
			title: target && target.title,
			type,
			date
		};
	},


	buildFeedbackEvent (f, lastViewed) {
		const {creator, SubmissionCreator: student} = f;
		const user = student;

		return Object.assign({ user, feedbackAuthor: creator },
			this.getEventConfig(
				f.isCreatedByAppUser
					? (creator === student
						? 'you-feedback'
						: 'you-feedback-theirs'
					)
					: 'they-feedback',
				f.AssignmentId,
				f.getCreatedTime(),
				lastViewed
			)
		);
	},


	buildSubmissionEvents (s, lastViewed) {
		const {creator: user} = s;
		const assignment = this.getAssignment(s.assignmentId);
		if (!assignment) {
			logger.warn('Dropping events for submission, no assignment found in the map for: %o', s);
			return [];
		}

		const out = this.deriveEvents(assignment, {Submission: s}, lastViewed);
		return out
			.filter(x => !/new|late/.test(x.type))
			.map(e => Object.assign(e, {user, type: `user-${e.type}`}));
	},


	deriveEvents (assignment, historyItem, lastViewed) {
		let now = new Date();
		const {Submission, Feedback, grade} = historyItem || {};

		let dateCompleted = Submission && Submission.getCreatedTime();

		let dateOpens = assignment.getAssignedDate();
		let dateDue = assignment.getDueDate() || now;
		let hasParts = (assignment.parts || []).length > 0;

		let events = [];

		const getConfig = (type, date) => this.getEventConfig(type, assignment, date, lastViewed);

		if (Feedback) {
			for(let f of Feedback) {
				events.push(this.buildFeedbackEvent(f, lastViewed));
			}
		}

		const EVENT_SPECS = [
			{
				type: 'grade-received',
				checkRequirements: ()=> grade && grade.value,
				getEventSpec: ()=> getConfig('grade-received', grade.getLastModified())
			},

			{
				type: 'new-assignment',
				checkRequirements: ()=> dateOpens < now,
				getEventSpec: ()=> getConfig('new-assignment', dateOpens)
			},

			{
				type: 'late-assignment',
				checkRequirements: ()=> dateDue < now && (!dateCompleted || dateCompleted > dateDue) && hasParts,
				getEventSpec: ()=> getConfig('late-assignment', dateDue)
			},

			{
				type: 'submitted-assignment',
				checkRequirements: ()=> dateCompleted && Submission && (Submission.parts || []).length > 0,
				getEventSpec: ()=> getConfig('submitted-assignment', dateCompleted)
			}
		];

		for (let spec of EVENT_SPECS) {
			if (spec.checkRequirements()) {
				events.push(spec.getEventSpec());
			}
		}

		return events;
	}
};
