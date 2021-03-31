export function getPropertyDescriptor(scope, property) {
	return !scope
		? null
		: Object.getOwnPropertyDescriptor(scope, property) ||
				getPropertyDescriptor(Object.getPrototypeOf(scope), property);
}
