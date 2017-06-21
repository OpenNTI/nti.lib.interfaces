import OrderedContents from '../../../ordered-contents';

const ContentPackageMimeType = 'application/vnd.nextthought.renderablecontentpackage';

const RefMimeType = 'application/vnd.nextthought.relatedworkref';
const TargetMimeType = 'application/vnd.nextthought.content';

function getDataForItem (item) {
	return {
		MimeType: RefMimeType,
		label: item.title,
		title: item.title,
		href: item.NTIID,
		type: TargetMimeType,
		icon: null,
		description: '',
		byline: '',
		target: item.NTIID
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
