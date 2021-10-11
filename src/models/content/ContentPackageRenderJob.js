import { Service } from '../../constants.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

const POLL_INTERVAL = 3000;
const POLL_TIMEOUT = Symbol('Poll Timeout');
const ACTIVE_POLL = Symbol('Active Poll');
const ON_INTERVAL = Symbol('On Interval');
const ON_FINISH = Symbol('On Finish');

const SUCCESS = 'Success';
const PENDING = 'Pending';
const FAILED = 'Failed';

function getIntervalTimeout(interval) {
	if (interval <= 5) {
		return POLL_INTERVAL;
	} else if (interval <= 15) {
		return POLL_INTERVAL * 3;
	} else {
		return 30000;
	}
}

export default class ContentPackageRenderJob extends Base {
	static MimeType = COMMON_PREFIX + 'content.packagerenderjob';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'JobId':     { type: 'string'  },
		'State':     { type: 'string'  },
	}

	getID() {
		return this.JobId;
	}

	get isSuccess() {
		return this.State === SUCCESS;
	}

	get isPending() {
		return this.State === PENDING;
	}

	get isFailed() {
		return this.State === FAILED;
	}

	get isFinished() {
		return this.isSuccess || this.isFailed;
	}

	startMonitor() {
		const wasRunning = this.running;
		this.running = true;

		if (!wasRunning) {
			this[ON_INTERVAL]();
		}
	}

	stopMonitor() {
		delete this.running;
		clearTimeout(this[POLL_TIMEOUT]);
	}

	[ON_INTERVAL](interval = 0) {
		if (!this.running) {
			return;
		}

		clearTimeout(this[POLL_TIMEOUT]);

		this[POLL_TIMEOUT] = setTimeout(() => {
			if (this[ACTIVE_POLL]) {
				return;
			}

			this[ACTIVE_POLL] = this.fetchLink({
				rel: 'QueryRenderJob',
				mode: 'raw',
			})
				.then(newJob => {
					const changed = newJob.State !== this.State;

					delete this[ACTIVE_POLL];

					this.refresh(newJob).then(() => {
						if (changed) {
							this.onChange();
						}

						if (!this.isFinished) {
							this[ON_INTERVAL](interval + 1);
						} else {
							this[ON_FINISH]();
						}
					});
				})
				.catch(() => {
					delete this[ACTIVE_POLL];
					this.State = FAILED;
				});
		}, getIntervalTimeout(interval));
	}

	[ON_FINISH]() {
		const service = this[Service];
		const parent = this.parent();

		if (parent) {
			service
				.getObject(parent.NTIID, { type: parent.MimeType })
				.then(obj => parent.refresh(obj.toJSON()))
				.then(() => parent.onChange());
		}
	}
}

Registry.register(ContentPackageRenderJob);
