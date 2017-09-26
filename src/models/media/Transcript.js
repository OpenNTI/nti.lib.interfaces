import {Parent} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

const EXISTING_TRANSCRIPT = ' A Transcript already exists';

export default
@model
class Transcript extends Base {
	static MimeType = [
		COMMON_PREFIX + 'ntitranscript'
	]

	static Fields = {
		...Base.Fields,
		'lang':     {type: 'string'},
		'purpose':  {type: 'string'},
		'src':      {type: 'string'},
		'srcjsonp': {type: 'string'},
		'type':     {type: 'string'}
	}


	_parentHasExisting (purpose, lang) {
		const parent = this[Parent];

		return parent && parent.getTranscriptFor && parent.getTranscriptFor(purpose, lang);
	}

	//TODO: fill out set lang


	setPurpose (purpose) {
		if (this._parentHasExisting(purpose, this.lang)) { return Promise.reject(EXISTING_TRANSCRIPT); }

		return this.save({purpose});
	}


	async setFile (file) {
		const data = new FormData();

		data.append(file.name, file);

		const newTranscript = await this.putToLink('edit', data);

		this.refresh(newTranscript);
		this.emit('changed');
	}
}
