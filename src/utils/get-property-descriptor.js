export default function getPropertyDescriptor (scope, property) {
	return Object.getOwnPropertyDescriptor(scope, property) || (
		Object.getPrototypeOf(scope) && getPropertyDescriptor(Object.getPrototypeOf(scope), property)
	);
}
