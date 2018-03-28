function getCompletedDate (item, items) {
	return items && (items[item.NTIID] || items[item.href] || items[item['Target-NTIID']] || items[item['target-NTIID']]);
}

export default function Applyer (targetModelClass) {
	Object.assign(targetModelClass.Fields, {
		'CompletionRequired':       { type: 'boolean' },
		'CompletionDefaultState':   { type: 'boolean' },
		'IsCompletionDefaultState': { type: 'boolean' },
		'CompletedDate':            { type: 'date'    },
	});

	return {
		getCompletedDate () {}, //implemented by CompletedDate date field.

		hasCompleted () {
			return this.getCompletedDate() != null;
		},


		async updateCompletedState (enrollment) {
			enrollment = enrollment || this.parent('getCompletedItems');

			if (!enrollment) { return; }

			try {
				const items = await enrollment.getCompletedItems();
				const oldCompletedDate = this.getCompletedDate();
				const completedDate = getCompletedDate(this, items);



				this.CompletedDate = completedDate;
				this.onChange('CompletedDate');

				if (oldCompletedDate !== this.getCompletedDate() && enrollment.updateCourseProgress) {
					enrollment.updateCourseProgress();
				}

				return this;
			} catch (e) {
				//Its fine if this fails
			}
		}
	};
}
