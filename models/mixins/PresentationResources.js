import urlJoin from '../../utils/urljoin';
import isEmpty from '../../utils/isempty';

const ASSET_MAP = {
	thumb: 'contentpackage-thumb-60x60.png',
	landing: 'contentpackage-landing-232x170.png',
	background: 'background.png'
};

let MISSING_ASSET_DATA = {};

/**
 * return the root that should be used if PlatforPresentationResources isn't defined
 * @return {string} default root to use
 */
function getDefaultAssetRoot(scope) {
	MISSING_ASSET_DATA[scope.getID()] = true;

	if (scope.getDefaultAssetRoot) {
		return scope.getDefaultAssetRoot();
	}

	console.warn('Missing implementation of "getDefaultAssetRoot" in', scope);
	return '';
}

export default {


	getAssetRoot () {
		if (this.presentationroot) { return this.presentationroot; }

		let resources = this.PlatformPresentationResources || [],
			root;

		resources.every(
			resource=> !(root = (resource.PlatformName === 'webapp') ? resource.href : root)
		);

		this.presentationroot = root || getDefaultAssetRoot(this);

		return this.presentationroot;
	},


	/**
	 * builds the url for the asset and returns a promise that fulfills if the img loads or rejects if it fails.
	 * @param  {string} name asset name to load
	 * @return {Promise} whether or not the asset exists
	 */
	getAsset (name) {
		let assetPath = ASSET_MAP[name] || ('missing-' + name + '-asset.png'),
			root = this.getAssetRoot(),
			url = root && urlJoin(root, assetPath);
			// cache = this[Service].getDataCache(),
			// cacheKey = 'asset-' + url;

		if (isEmpty(root)) {
			return Promise.reject('No root');
		}

		return Promise.resolve(url);
	}

};
