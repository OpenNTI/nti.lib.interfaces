import OrderedContents from '../../../ordered-contents';

const ContentPackageMimeType = 'application/vnd.nextthought.renderablecontentpackage';

const RefMimeType = 'application/vnd.nextthought.relatedworkref';
const TargetMimeType = 'application/vnd.nextthought.content';

function getDataForItem (item) {
	return {
		MimeType: RefMimeType,
		targetMimeType: TargetMimeType,
		label: item.title,
		title: item.title,
		'Target-NTIID': item.NTIID
	};
}

export default {
	handles: [ContentPackageMimeType],

	placeItemIn (item, container) {
		const orderedContents = new OrderedContents(container);
		const data = getDataForItem(item);

		return orderedContents.append(data);
	}
};
