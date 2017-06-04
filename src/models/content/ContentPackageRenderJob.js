import {Service} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const POLL_INTERVAL = 3000;
const POLL_TIMEOUT = Symbol('Poll Timeout');
const ON_INTERVAL = Symbol('On Interval');
const ON_FINISH = Symbol('On Finish');

const SUCCESS = 'Success';
const PENDING = 'Pending';
const FAILED = 'Failed';

@model
export default class ContentPackageRenderJob extends Base {
	static MimeType = COMMON_PREFIX + 'content.packagerenderjob'

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
		if (!this.running) {
			this[ON_INTERVAL]();
		}

		this.running = true;
	}


	stopMonitor () {
		delete this.running;
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
							} else {
								this[ON_FINISH]();
							}
						});
				})
				.catch(() => {
					this.State = FAILED;
				});
		}, POLL_INTERVAL);
	}


	[ON_FINISH] () {
		const service = this[Service];
		const parent = this.parent();

		if (parent) {
			service.getObject(parent.NTIID, {type: parent.MimeType})
				.then((obj) => parent.refresh(obj.toJSON()))
				.then(() => parent.onChange());
		}
	}
}
