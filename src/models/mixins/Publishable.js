import pluck from 'nti-commons/lib/pluck';
import parseDate from 'nti-commons/lib/parse-date';

export default {
	isPublished () {
		return !!this.PublicationState;
	},

	getPublishDate () {
		return parseDate(this.publishBeginning);
	},

	setPublishState (state) {
		const publish = !!state;
		const link = publish ? 'publish' : 'unpublish';
		const payload = state instanceof Date ? {'publishBeginning': state.getTime() / 1000} : void state;

		return this.postToLink(link, payload)
			.then(o => this.refresh(pluck(o, 'NTIID', 'Links', 'publishBeginning', 'PublicationState')))
			.then(() => this.onChange('publish'));
	}
};
