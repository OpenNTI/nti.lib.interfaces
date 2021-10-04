/**
 * @template {import('../constants').Constructor} T
 * @param {T} Base
 * @param {string} [ItemsKey='Items']
 * @mixin
 */
export const ArrayLike = (Base, ItemsKey = 'Items') => {
	const ArrayProto = Array.prototype;

	/**
	 * This is meant to only implement a read-only array interface.
	 * To mutate, use the `ItemsKey` directly.
	 */
	return class extends Base {
		get length() {
			return this[ItemsKey]?.length ?? 0;
		}

		//at?
		at(index) {
			return ArrayProto.at.call(this[ItemsKey] ?? [], index);
		}

		every(callback) {
			return ArrayProto.every.call(this[ItemsKey] ?? [], callback);
		}

		find(callback) {
			return ArrayProto.find.call(this[ItemsKey] ?? [], callback);
		}

		findIndex(callback) {
			return ArrayProto.findIndex.call(this[ItemsKey] ?? [], callback);
		}

		includes(callback) {
			return ArrayProto.includes.call(this[ItemsKey] ?? [], callback);
		}

		map(callback) {
			return ArrayProto.map.call(this[ItemsKey] ?? [], callback);
		}

		some(callback) {
			return ArrayProto.some.call(this[ItemsKey] ?? [], callback);
		}

		[Symbol.iterator]() {
			return (this[ItemsKey] || [])[Symbol.iterator]();
		}
	};
};
