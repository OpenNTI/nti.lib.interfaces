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
		}
	};
}
