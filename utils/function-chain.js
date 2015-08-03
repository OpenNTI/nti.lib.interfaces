
export default function chain (original, toChain) {
	return function () {
		let r = original.apply(this, arguments);
		toChain.apply(this, arguments);
		return r;
	};
}
