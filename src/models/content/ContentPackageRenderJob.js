import Base from '../Base';

const POLL_INTERVAL = 3000;
const POLL_TIMEOUT = Symbol('Poll Timeout');
const ON_INTERVAL = Symbol('On Interval');

const SUCCESS = 'Success';
const PENDING = 'Pending';
const FAILED = 'Failed';

export default class ContentPackageRenderJob extends Base {
	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getID () {
		return this.JobId;
	}


	get isSuccess () {
		return this.State === SUCCESS;
	}


	get isPending () {
		return this.State === PENDING;
	}


	get isFailed () {
		return this.State === FAILED;
	}


	get isFinished () {
		return this.isSuccess || this.isFailed;
	}


	startMonitor () {
		this[ON_INTERVAL]();
	}


	stopMonitor () {
		clearTimeout(this[POLL_TIMEOUT]);
	}


	[ON_INTERVAL] () {
		clearTimeout(this[POLL_TIMEOUT]);

		this[POLL_TIMEOUT] = setTimeout(() => {
			this.fetchLink('QueryRenderJob')
				.then(newJob => {
					const changed = newJob.State !== this.State;

					this.refresh(newJob)
						.then(() => {
							if (changed) {
								this.onChange();
							}

							if (!this.isFinished) {
								this[ON_INTERVAL]();
							}
						});
				})
				.catch(() => {
					this.State = FAILED;
				});
		}, POLL_INTERVAL);
	}
}
