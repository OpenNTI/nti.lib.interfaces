const isDeferredValue = Symbol('Is Value Resolver');

export default function deferredValue (value) {
	if (value && value[isDeferredValue]) { return value; }

	let resolved = value;

	return {
		[isDeferredValue]: true,

		resolve: async () => {
			if (typeof resolved === 'function') {
				resolved = await resolved();
			}

			return resolved;
		}
	};
}
