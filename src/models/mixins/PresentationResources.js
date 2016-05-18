import {Service} from '../../constants';
import urlJoin from 'nti-commons/lib/urljoin';
import isEmpty from 'isempty';

const ASSET_MAP = {
	thumb: 'contentpackage-thumb-60x60.png',
	landing: 'contentpackage-landing-232x170.png',
	background: 'background.png',
	promo: 'course-promo-large-16x9.png'
};

let MISSING_ASSET_DATA = {};

/**
 * return the root that should be used if PlatforPresentationResources isn't defined
 * @param {Model} scope the instance of the model that this is mixed into.
 * @returns {string} default root to use
 */
function getDefaultAssetRoot (scope) {
	MISSING_ASSET_DATA[scope.getID()] = true;

	if (scope.getDefaultAssetRoot) {
		return scope.getDefaultAssetRoot();
	}

	console.warn('Missing implementation of "getDefaultAssetRoot" in', scope); //eslint-disable-line no-console
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
	 * builds the url for the asset and returns a promise that fulfills with that image url.
	 * Optionally adding a HEAD request to check existence.
	 *
	 * @param {string} name asset name to load
	 * @param {boolean} resolve flag to ask to make a head request to check exists.
	 * @return {Promise} fulfills with the assets url. If resolve is true, then if the asset exists, otherwise rejects.
	 */
	getAsset (name, resolve = false) {
		const assetPath = ASSET_MAP[name] || `missing-${name}-asset.png`;
		const root = this.getAssetRoot();
		const url = root && urlJoin(root, assetPath);

		const service = this[Service];
		const cache = service.getDataCache();
		const cacheKey = 'asset-' + url;

		if (isEmpty(root)) {
			return Promise.reject('No root');
		}

		if (!resolve || cache.get(cacheKey) === true) {
			return Promise.resolve(url);
		}

		const cached = cache.get(cacheKey);
		if (cached && cached.then) {
			return cached;
		}

		const pending = service.head(url)
			.then(
				() => url,
				() => Promise.reject(`no asset: ${url}`)
			);

		cache.setVolatile(cacheKey, pending);

		pending.then(
			() => cache.set(cacheKey, true),
			()=> {} //don't care
		);

		return pending;
	}

};
