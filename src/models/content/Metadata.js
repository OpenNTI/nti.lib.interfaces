import {Parser as parse} from '../../constants';
import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class Metadata extends Base {
	static MimeType = COMMON_PREFIX + 'metadata.contentmetadata'

	constructor (service, parent, data) {
		super(service, parent, data);

		/*
		{
			"contentLocation": "http://...",
			"contentMimeType": "text/html",
			"description": "...",
			"images": [...],
			"sourceLocation": "http://...",
			"sourcePath": null,
			"title": "..."
		}
		*/
		this[parse]('images', []);
	}
}
