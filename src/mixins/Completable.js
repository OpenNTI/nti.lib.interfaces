export default function Applyer (targetModelClass) {
	Object.assign(targetModelClass.Fields, {
		'CompletionRequired':       { type: 'boolean' },
		'CompletionDefaultState':   { type: 'boolean' },
		'IsCompletionDefaultState': { type: 'boolean' }
	});

	return {};
}
