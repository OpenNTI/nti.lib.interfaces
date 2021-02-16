const ContentPackageMimeType = 'application/vnd.nextthought.contentpackage';
const RenderableContentPackageMimeType =
	'application/vnd.nextthought.renderablecontentpackage';

export default {
	handles: [ContentPackageMimeType, RenderableContentPackageMimeType],

	removeItemFrom(item, container) {
		return container.requestLink('RemoveRefs', 'delete', void 0, {
			target: item.NTIID,
		});
	},
};
