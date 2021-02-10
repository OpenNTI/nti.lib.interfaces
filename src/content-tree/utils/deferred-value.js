const isDeferredValue = Symbol('Is Value Resolver');

export default function deferredValue (value) {
	if (value && value[isDeferredValue]) { return value; }

	let resolved = value;

	return {
		[isDeferredValue]: true,

		resolve: async () => {
			if (typeof value === 'function') {
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
		}
	};
}
