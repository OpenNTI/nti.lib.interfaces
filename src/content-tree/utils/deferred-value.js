const isDeferredValue = Symbol('Is Value Resolver');

export function deferredValue(value) {
	if (value && value[isDeferredValue]) {
		return value;
	}

	let resolved = value;

	return {
		[isDeferredValue]: true,

		resolve: async () => {
			if (typeof resolved === 'function') {
				const resolver = resolved;
				resolved = new Promise((resolve, reject) => {
					Promise.resolve(resolver())
						.then(x => {
							resolved = x;
							resolve(x);
						})
						.catch(reject);
				});
			}

			return resolved;
		},
	};
}
