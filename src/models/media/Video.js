import isEmpty from 'isempty';

import UserDataStore from '../../stores/UserData';
import {
	REL_RELEVANT_CONTAINED_USER_GENERATED_DATA,
	Service,
} from '../../constants';
import getLink from '../../utils/getlink';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const UserData = Symbol('UserData');

const NO_TRANSCRIPT = 'No Transcript';
const NO_TRANSCRIPT_LANG = 'No Transcript for the requested language.';
const EXISTING_TRANSCRIPT = 'A Transcript already exists';

//TODO: look into turning transcripts into full fledged models

export default
@model
class Video extends Base {
	static MimeType = [
		COMMON_PREFIX + 'ntivideo',
		COMMON_PREFIX + 'video',
	]

	static Fields = {
		...Base.Fields,
		'itemprop':    { type: 'string'   }, //From a parsed DomObject
		'sources':     { type: 'model[]'  },
		'title':       { type: 'string'   }, //From a parsed DomObject
		'transcripts': { type: 'model[]'  },
		'ntiid':       { type: 'string'   },
		'label':       { type: 'string'   }
	}

	isVideo = true

	constructor (service, parent, data) {
		super(service, parent, data);

		Object.assign(this, {
			NO_TRANSCRIPT,
			NO_TRANSCRIPT_LANG,
			EXISTING_TRANSCRIPT
		});
	}


	getThumbnail () {
		let first = this.sources[0];
		return first ? first.getThumbnail() : Promise.reject('No Source');
	}


	getPoster () {
		let first = this.sources[0];
		return first ? first.getPoster() : Promise.reject('No Source');
	}


	getDuration () {
		let first = this.sources[0];
		return first ? first.getDuration() : Promise.reject('No Source');
	}


	/**
	 * @param {string} [lang] Request a language specific transcript. If
	 *                        nothing is provided, it will default to english.
	 * @returns {Promise} A promise of a transcript or a rejection.
	 */
	getTranscript (lang) {
		let target = lang || 'en';
		let scripts = this.transcripts;

		if (isEmpty(scripts)) {
			return Promise.reject(NO_TRANSCRIPT);
		}

		target = this.transcripts.reduce(
			(result, potential)=>
				result || (potential.lang === target && potential), null);

		if (!target) {
			return Promise.reject(NO_TRANSCRIPT_LANG);
		}

		return this[Service].get(target.src);
	}


	getUserData () {
		let store = this[UserData];
		let service = this[Service];
		let id = this.getID();

		if (!store) {
			store = this[UserData] = new UserDataStore(service, id,
				service.getContainerURL(id, REL_RELEVANT_CONTAINED_USER_GENERATED_DATA));
		}

		return Promise.resolve(store);//in the future, this may need to be async...
	}


	delete () {
		return super.delete('self');
	}


	getTranscriptFor (purpose, lang) {
		const {transcripts} = this;

		for (let transcript of (transcripts || [])) {
			if (transcript.purpose === purpose && transcript.lang === lang) {
				return transcript;
			}
		}

		return null;
	}


	async addTranscript (file, purpose, lang) {
		if (this.getTranscriptFor(purpose, lang)) { return Promise.reject(EXISTING_TRANSCRIPT); }

		const link = this.getLink('transcript');

		if (!link) { return Promise.reject('No Link'); }

		const formData = new FormData();

		formData.append(file.name, file);

		if (purpose) { formData.append('purpose', purpose); }
		if (lang) { formData.append('lang', lang); }

		const transcript = await this[Service].post(link, formData);

		await this.refresh();

		this.emit('change');

		return transcript;
	}


	async removeTranscript (transcript) {
		const link = getLink(transcript, 'edit');

		if (!link) { return Promise.reject('Unable to delete transcript'); }

		await this[Service].delete(link);
		await this.refresh();

		this.emit('change');
	}


	applyCaptions (captionsFile, purpose) {
		const formdata = new FormData();
		formdata.append(captionsFile.name, captionsFile);
		if(purpose) {
			formdata.append('purpose', purpose);
		}
		return this[Service].post(this.getLink('transcript'), formdata);
	}


	async replaceTranscript (newTranscript, existing) {
		const { purpose } = existing;

		await this.removeTranscript(existing);
		const updatedTranscript = await newTranscript.setPurpose(purpose);
		await this.refresh();

		return updatedTranscript;
	}
}
