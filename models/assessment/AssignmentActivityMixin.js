/*
import React from 'react';
import cx from 'classnames';

import If from 'common/components/Conditional';
import {scoped} from 'common/locale';

const t = scoped('COURSE.ASSIGNMENTS.ACTIVITY');

export default React.createClass({
	displayName: 'ActivityItem',

	render () {
		const {props: {event, collection}} = this;
		const {date, title, type, suffix, assignment, unread} = event;
		const today = new Date((new Date()).setHours(0, 0, 0, 0));

		let format = 'MMM D'; // "Jan 2" ... Short month, Day of month without zero padding
		if (date > today) {
			format = 'h:mm a'; // "8:05 pm" ...Hours without zero padding, ":", minutes with zero padding, lower-case "am/pm"
		}

		return (
			<div className={cx('item', {unread})}>
				<DateTime date={date} showToday format={format}/>
				<span className="type">{t(type)}</span>
				<span className="assignment-name">{title}</span>
				<If condition={suffix}>
					<span className="label suffix">{suffix}</span>
				</If>
			</div>
		);
	}
});


 */


export default {

	getEventConfig (type, target, date, lastSeen) {
		if (typeof target === 'string') {
			target = this.getAssignment(target);
			if (!target) {
				console.error('Dropping event, no assignment found in the map for:', target);
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
		const {creator: user} = f;
		return Object.assign({ user },
			this.getEventConfig(
				f.isCreatedByAppUser ? 'you-feedback' : 'they-feedback',
				f.AssignmentId,
				f.getCreatedTime(),
				lastViewed
			)
		);
	},


	deriveEvents (assignment, historyItem, lastViewed) {
		let now = new Date();
		const {Submission, Feedback, Grade} = historyItem;

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
				checkRequirements: ()=> Grade && Grade.value,
				getEventSpec: ()=> getConfig('grade-received', Grade.getLastModified())
			},

			{
				type: 'grade-received',
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
