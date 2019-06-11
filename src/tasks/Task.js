import EventEmitter from 'events';

import callOnce from './utils/call-once-monitor';

const NotStarted = 'not-started';
const Running = 'running';
const Resolved = 'resolved';
const Rejected = 'rejected';
const Canceling = 'canceling';
const Canceled = 'canceled';

const ChangeEvent = 'state-changed';

export default class Task extends EventEmitter {
	#StartProcess = null
	#ActiveProcess = null
	#State = NotStarted

	#resolve = null
	#reject = null
	#cancel = null

	#canRetry = false;

	#progressCurrent = null
	#progressTotal = null

	#name = null

	constructor (startProcess) {
		super();

		if (!startProcess || typeof startProcess !== 'function') { throw new Error('Task must be provided a method to start a process'); }

		this.#StartProcess = startProcess;

		this.#setup();
	}

	#setState = (state) => {
		this.#State = state;

		if (this.setStateTimeout) {
			return;
		}

		this.setStateTimeout = setImmediate(() => {
			this.emit(ChangeEvent);
			delete this.setStateTimeout;
		});
	}

	addChangeListener (fn) {
		this.addListener(ChangeEvent, fn);

		return () => {
			this.removeChangeListener(fn);
		};
	}

	removeChangeListener (fn) {
		this.removeListener(ChangeEvent, fn);
	}


	#setProgress = (current, total) => {
		this.#progressCurrent = current;
		this.#progressTotal = total;
		this.emit(ChangeEvent);
	}

	#clearProgress = () => {
		this.#progressCurrent = null;
		this.#progressTotal = null;
		this.emit(ChangeEvent);
	}

	#setup = () => {
		this.#canRetry = false;

		this.#clearProgress();

		this.#resolve = callOnce('task.resolve');
		this.#reject = callOnce('task.reject');
		this.#cancel = callOnce('task.cancel');

		this.#resolve.onceCalled(() => this.#setState(Resolved));
		this.#reject.onceCalled(() => this.#setState(Rejected));
		this.#cancel.onceCalled(() => this.#setState(Canceled));
	}

	get isStarted () { return this.#State !== NotStarted; }

	get isRunning () { return this.#State === Running; }
	get isResolved () { return this.#State === Resolved; }
	get isRejected () { return this.#State === Rejected; }
	
	get isCanceling () { return this.#State === Canceling; }
	get isCanceled () { return this.#State === Canceled; }

	get isFinished () { return this.#State === Resolved || this.#State === Rejected || this.#State === Canceled; }

	get canStart () { return !this.isStarted && !this.isRunning && !this.isFinished; }
	get canRetry () { return (this.#State === Rejected || this.#State === Canceled) && this.#canRetry; }
	get canCancel () { return this.isRunning && this.#ActiveProcess && !!this.#ActiveProcess.cancel; }

	get hasProgress () { return this.#progressTotal != null; }
	get progress () {
		if (!this.hasProgress) { return null;}

		return {current: this.#progressCurrent || 0, total: this.#progressTotal};
	}

	get hasName () { return !!this.#name; }
	get name () { return this.#name; }

	setName (name) {
		this.#name = name;
		this.emit(ChangeEvent);
	}

	start () {
		if (this.isStarted) { throw new Error('Cannot start a task that has already been started'); }
		if (this.isFinished) { throw new Error('Cannot start a task that has already finished'); }
		if (this.isRunning) { return; }

		const start = this.#StartProcess;

		this.#canRetry = false;

		this.#setState(Running);
		
		this.#ActiveProcess = start({
			resolve: this.#resolve,
			reject: this.#reject,
			setProgress: this.#setProgress,
			canRetry: () => this.#canRetry = true
		});
	}

	async cancel () {
		if (!this.isRunning || !this.#ActiveProcess) { throw new Error('Cannot cancel task that is not running'); }
		if (!this.#ActiveProcess.cancel) { throw new Error('The active process does not support cancel'); }

		this.#clearProgress();
		this.#setState(Canceling);

		await this.#ActiveProcess.cancel();

		this.#cancel();
	}


	retry () {
		if (this.running) { throw new Error('Cannot retry task that is currently running'); }
		if (this.resolved) { throw new Error('Cannot retry task that was successful'); }
		if (this.notStarted) { throw new Error('Cannot retry task that has not been started');}
		if (!this.canRetry) { throw new Error('Task is not able to be retried'); }

		this.#setState(NotStarted);

		this.#setup();
		this.start();
	}


	then (resolve, reject) {
		this.#resolve.onceCalled((...args) => resolve(...args));
		this.#reject.onceCalled((...args) => reject(...args));
		this.#cancel.onceCalled(() => {
			const e = new Error('Task Canceled');

			e.wasCanceled = true;

			reject(e);
		});

		if (!this.isStarted) {
			this.start();
		}
	}

}