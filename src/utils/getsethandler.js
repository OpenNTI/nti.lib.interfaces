export default function getSetHandler(scope, property, silent) {
	return function (v) {
		let old = scope[property];
		scope[property] = v;
		if (scope.emit && silent !== true) {
			scope.emit('change', scope, property, v, old);
		}
	};
}
