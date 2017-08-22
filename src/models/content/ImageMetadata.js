import {model, COMMON_PREFIX} from '../Registry';
import Base from '../Base';

export default
@model
class ImageMetadata extends Base {
	static MimeType = COMMON_PREFIX + 'metadata.imagemetadata'

	constructor (service, parent, data) {
		super(service, parent, data);

		/*
		{
			"Class": "ImageMetadata",
			"Links": [
				{
					"Class": "Link",
					"href": "...",
					"rel": "safeimage"
				}
			],
			"MimeType": "application/vnd.nextthought.metadata.imagemetadata",
			"height": null,
			"url": "http://cfvod.kaltura.com/p/1500101/sp/150010100/thumbnail/entry_id/0_vy1ysjiu/version/100012/width/400",
			"width": null
		}
		*/
	}
}
