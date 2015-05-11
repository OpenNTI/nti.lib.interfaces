import isEmpty from '../utils/isempty';
import MediaSource from './MediaSource';
import {Service, Parent} from '../CommonSymbols';

const NO_TRANSCRIPT = 'No Transcript';
const NO_TRANSCRIPT_LANG = 'No Transcript for the requested language.';

export default class Video {
	constructor (service, parent, data) {
		this[Service] = service;
		this[Parent] = parent;

		Object.assign(this, {
			NO_TRANSCRIPT,
			NO_TRANSCRIPT_LANG
		});

		let sources = data.sources;

		Object.assign(this, data);

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
	 * @return {Promise}
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


	getPageSource () {
		return this[Parent].getPageSource(this);
	}
}
