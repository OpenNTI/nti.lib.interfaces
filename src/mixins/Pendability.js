import { wait } from '@nti/lib-commons';

const PRIVATE_PENDING = new WeakMap();
const getPending = p => PRIVATE_PENDING.get(p) || [];
const setPending = (p, list) => (PRIVATE_PENDING.set(p, list), list);

/**
 * @template {import('../types').Constructor} T
 * @param {T} Base
 * @mixin
 */
export const mixin = Base =>
	class extends Base {
		getPending() {
			return getPending(this);
		}

		addToPending(...pending) {
			let list = getPending(this);
			setPending(this, list); //ensure (for request contexts that don't get the constructor call)

			function remove(p) {
				return () => {
					//remember JavaScript is not multi-threaded,
					// this action is effectively atomic... if that ever changes (it won't), this is not thread safe ;)
					let i = list.indexOf(p);
					if (i >= 0) {
						list.splice(i, 1); //remove promise from the array
					}
				};
			}

			for (let p of pending) {
				if (!p) {
					continue;
				}

				if (p.addToPending) {
					this.addToPending(...getPending(p));
				} else if (p.then) {
					list.push(p);

					p.finally(remove(p));
				} else if (Array.isArray(p)) {
					this.addToPending(...p);
				} else {
					console.warn('Unexpected object in the pending queue: ', p); //eslint-disable-line no-console
				}
			}

			return this; //allow chain
		}

		async waitForPending(timeout) {
			return wait.on(getPending(this), timeout).then(() => this);
		}
	};

const Prototype = mixin(class {}).prototype;

export function attach(context) {
	setPending(context, getPending(context));

	for (let method of Object.getOwnPropertyNames(Prototype)) {
		if (method === 'constructor') {
			continue;
		}

		if (!context[method]) {
			context[method] = function (...pending) {
				return Prototype[method].apply(context, pending);
			};
		}
	}

	return context;
}
