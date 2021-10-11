import Completable from '../../../mixins/Completable.js';
import { createPollingTask } from '../../../tasks/index.js';
import Registry, { COMMON_PREFIX } from '../../Registry.js';
import Base from '../../Base.js';

const IMPLICIT_ERROR = Symbol('Implicit Error');

const POLL_INTERVAL = 1000;
const POLL_STEP_OFF = 1000;

const CREATED = 'created';
const RUNNING = 'running';
const ERROR = 'error';
const FINISHED = 'finished';

export class SCORMContentInfo extends Completable(Base) {
	static MimeType = [COMMON_PREFIX + 'scorm.scormcontentinfo'];

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'scorm_id':   { type: 'string', name: 'scormId'   },
		'title':      { type: 'string'                    },
		'upload_job': { type: 'object', name: 'uploadJob' }
	}

	get isProcessing() {
		const { uploadJob } = this;

		return (
			uploadJob &&
			(uploadJob.State === CREATED || uploadJob.State === RUNNING)
		);
	}

	get isErrored() {
		const { uploadJob } = this;

		return this[IMPLICIT_ERROR] || (uploadJob && uploadJob.State === ERROR);
	}

	get isReady() {
		const { uploadJob } = this;

		return !uploadJob || uploadJob.State === FINISHED;
	}

	get errorMessage() {
		const { uploadJob } = this;

		return uploadJob && uploadJob.ErrorMessage;
	}

	get fileName() {
		const { uploadJob } = this;

		return uploadJob && uploadJob.UploadFilename;
	}

	getPoll() {
		const poll = async (cont, done) => {
			try {
				const updated = await this.fetchLink({
					mode: 'raw',
					rel: 'SCORMContentAsyncUploadStatusUpdate',
				});

				await this.refresh(updated);
				this.onChange();

				if (this.isProcessing) {
					cont();
				} else {
					done();
				}
			} catch (e) {
				done();
				this[IMPLICIT_ERROR] = e;
				this.onChange();
			}
		};

		return createPollingTask(poll, POLL_INTERVAL, POLL_STEP_OFF);
	}
}

Registry.register(SCORMContentInfo);
