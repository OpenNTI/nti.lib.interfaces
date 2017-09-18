import isEmpty from 'isempty';

import UserDataStore from '../../stores/UserData';
import {
	REL_RELEVANT_CONTAINED_USER_GENERATED_DATA,
	Service,
} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

import MediaSource from './MediaSource';

const UserData = Symbol('UserData');

const NO_TRANSCRIPT = 'No Transcript';
const NO_TRANSCRIPT_LANG = 'No Transcript for the requested language.';

export default
@model
class Video extends Base {
	static MimeType = [
		COMMON_PREFIX + 'ntivideo',
		COMMON_PREFIX + 'video',
	]

	constructor (service, parent, data) {
		super(service, parent, data);

		Object.assign(this,{
			isVideo: true
		});

		Object.assign(this, {
			NO_TRANSCRIPT,
			NO_TRANSCRIPT_LANG
		});

		const {sources = []} = data;

		this.sources = sources.map(item =>
			new MediaSource(service, this, item));
	}


	getThumbnail () {
		let first = this.sources[0];
		return first ? first.getThumbnail() : Promise.reject('No Source');
	}


	getPoster () {
		let first = this.sources[0];
		return first ? first.getPoster() : Promise.reject('No Source');
	}


	getID () {
		return this.ntiid;
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


	applyCaptions (captionsFile, purpose) {
		const formdata = new FormData();
		formdata.append(captionsFile.name, captionsFile);
		if(purpose) {
			formdata.append('purpose', purpose);
		}
		return this[Service].post(this.getLink('transcript'), formdata);
	}


	replaceTranscript (transcript, newFile) {
		const formdata = new FormData();
		formdata.append(newFile.name, newFile);
		return this[Service].put(transcript.href, formdata);
	}


	removeTranscript (transcript) {
		return this[Service].delete(transcript.href)
			.then(() => this.refresh());
	}


	updateTranscript (transcript, purpose, lang) {
		let jsonData = {};

		if(purpose) {
			jsonData.purpose = purpose;
		}

		if(lang) {
			jsonData.lang = lang;
		}

		return this[Service].put(transcript.href, jsonData);
	}
}
