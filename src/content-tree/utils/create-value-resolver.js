const isValueResolver = Symbol('Is Value Resolver');

export default function createValueResolver (value) {
	if (value && value[isValueResolver]) { return value; }

	let resolved = value;

	return {
		[isValueResolver]: true,

		resolve: async () => {
			if (typeof resolved === 'function') {
				resolved = await resolved();
			}

			return resolved;
		}
	};
}
