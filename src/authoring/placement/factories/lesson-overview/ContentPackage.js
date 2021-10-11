const ContentPackageMimeType = 'application/vnd.nextthought.contentpackage';
const RenderableContentPackageMimeType =
	'application/vnd.nextthought.renderablecontentpackage';

export default {
	handles: [ContentPackageMimeType, RenderableContentPackageMimeType],

	removeItemFrom(item, container) {
		return container.deleteLink('RemoveRefs', {
			target: item.NTIID,
		});
	},
};
