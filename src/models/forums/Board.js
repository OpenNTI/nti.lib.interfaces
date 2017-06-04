import GetContents from '../../mixins/GetContents';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

@model
export default class Board extends Base {
	static MimeType = [
		COMMON_PREFIX + 'forums.board',
		COMMON_PREFIX + 'forums.communityboard',
		COMMON_PREFIX + 'forums.contentboard',
		COMMON_PREFIX + 'forums.dflboard',
	]

	constructor (service, parent, data) {
		super(service, parent, data, GetContents);
		// ForumCount: 1
		// description: ""
		// title: "Discussions"
	}
}
