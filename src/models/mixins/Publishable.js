import pluck from 'nti-commons/lib/pluck';
import parseDate from 'nti-commons/lib/parse-date';

export default {
	isPublished () {
		return !!this.PublicationState;
	},

	getPublishDate () {
		return parseDate(this.publishBeginning);
	},

	setPublishState (state, ...additionalChangingFields) {
		const publish = !!state;
		const link = publish ? 'publish' : 'unpublish';
		const payload = state instanceof Date ? {'publishBeginning': state.getTime() / 1000} : void state;

		//JSG: The REST interface reserves "POST" for creating objects not modifiying. This (IMHO) should be a "PUT"
		return this.postToLink(link, payload)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links', 'publishBeginning', 'PublicationState', ...additionalChangingFields)))
			.then(() => this.onChange('publish'));
	}
};