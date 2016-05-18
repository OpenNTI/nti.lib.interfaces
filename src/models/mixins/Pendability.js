import waitFor from 'nti-commons/lib/waitfor';

const noop = () => {};
const PRIVATE_PENDING = new WeakMap();
const getPending = p => PRIVATE_PENDING.get(p) || [];
const setPending = (p, list) => (PRIVATE_PENDING.set(p, list), list);

const mixin = {

	constructor () {
		setPending(this, []);
	},


	addToPending (...pending) {
		let list = getPending(this);
		setPending(this, list); //ensure (for request contexts that don't get the constructor call)


		function remove (p) {
			return ()=> {
				//remember JavaScript is not multi-threaded,
				// this action is effectively atomic... if that ever changes (it won't), this is not thread safe ;)
				let i = list.indexOf(p);
				if (i >= 0) {
					list.splice(i, 1);//remove promise from the array
				}
			};
		}


		for (let p of pending) {
			if (!p) {
				continue;
			}

			if (p.addToPending) {
				this.addToPending(...getPending(p));
			}
			else if (p.then) {

				list.push(p);

				p.catch(noop)//prevent failures from interupting our cleanup
					.then(remove(p));
			}
			else {
				console.warn('Unexpected object in the pending queue: ', p); //eslint-disable-line no-console
			}
		}

		return this;//allow chain
	},


	waitForPending (timeout) {
		return waitFor(getPending(this), timeout).then(()=> this);
	}

};

export default mixin;

export function attach (context) {
	setPending(context, getPending(context));

	for (let method of Object.keys(mixin)) {
		if (method === 'constructor') { continue; }

		if (!context[method]) {
			context[method] = function (...pending) {
				return mixin[method].apply(context, pending);
			};
		}
	}

	return context;
}
