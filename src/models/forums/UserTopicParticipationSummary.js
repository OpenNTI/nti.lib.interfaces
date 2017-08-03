import {Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class UserTopicParticipationSummary extends Base {
	static MimeType = COMMON_PREFIX + 'forums.usertopicparticipationsummary'

	constructor (service, parent, data) {
		super(service, parent, data);

		this[parse]('Contexts');
	}

	get comments () {
		return this.TopLevelCount;
	}

	get replies () {
		return this.ReplyToCount;
	}

	get repliesTo () {
		return this.NestedChildReplyCount;
	}
}
