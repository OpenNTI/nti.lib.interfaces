/** @typedef {import('../types').Constructor} Constructor */

/**
 * @template {Constructor} T
 * @param {boolean} value
 * @param {T} Base
 * @mixin
 */
export function Avatar(value, Base) {
	return class extends Base {
		get avatar() {
			return value;
		}
	};
}

/**
 * @template {Constructor} T
 * @param {boolean} value
 * @param {T} Base
 * @mixin
 */
export function HasMembers(value, Base) {
	return class extends Base {
		get hasMembers() {
			return value;
		}
	};
}

/**
 * @template {Constructor} T
 * @param {boolean} value
 * @param {T} Base
 * @mixin
 */
export function AutoSubscribable(value, Base) {
	return class extends Base {
		get autoSubscribable() {
			return value;
		}
	};
}
