import noop from '../../utils/empty-function';
import waitFor from '../../utils/waitfor';
import { Pending } from '../../CommonSymbols';

export default {

	constructor () {
		this[Pending] = [];
	},


	addToPending (...pending) {
		let list = this[Pending] = (this[Pending] || []);

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
			if (!p) { continue; }

			if (Array.isArray(p[Pending])) {
				this.addToPending(...p[Pending]);
			} else if (p.then) {
				list.push(p);
				p.catch(noop)//prevent failures from interupting our cleanup
					.then(remove(p));
			} else {
				console.warn('Unexpected object in the pending queue: ', p);
			}
		}

		return this;//allow chain
	},


	waitForPending () {
		return waitFor(this[Pending]);
	}

};
