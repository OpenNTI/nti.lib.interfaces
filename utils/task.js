export default class Task {
	constructor (fn, interval) {
		this.fn = fn;
		this.interval = interval || 1000;
	}

	start () {
		if (this._id) {
			return;
		}
		this._id = setInterval(this.fn, this.interval);
	}

	stop () {
		clearInterval(this._id);
		delete this._id;
	}
}
