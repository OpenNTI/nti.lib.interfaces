import { parse as parseUrl } from 'url';
import { extname } from 'path';

import mime from 'mime-types';

import { isNTIID } from '@nti/lib-ntiids';

import { mixin as ContentTree } from '../../content-tree/index.js';
import Completable from '../../mixins/Completable.js';
import UserDataStore from '../../stores/UserData.js';
import {
	REL_RELEVANT_CONTAINED_USER_GENERATED_DATA,
	Service,
} from '../../constants.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Model.js';

import Pages from './mixins/Pages.js';

const UserData = Symbol('UserData');

/*
Internal Links:
           NTIID: "tag:nextthought.com,2011-10:OU-RelatedWorkRef...:digestion_and_metabolism_textbook1"
         creator: "OpenStack, Heather Smith, and Eric Bright"
            desc: "Read this material about Digestion and Metabolism."
            icon: "resources/.../fd35e23767020999111e1f49239199b4c5eff23e.png"
            abel: "Digestion and Metabolism Textbook Reading 1"
            href: "tag:nextthought.com,2011-10:OU-HTML-...:digestion_and_metabolism_textbook1"
    target-NTIID: "tag:nextthought.com,2011-10:OU-HTML-...:digestion_and_metabolism_textbook1"
  targetMimeType: "application/vnd.nextthought.content"


External Links:
           NTIID: "tag:nextthought.com,2011-10:OU-RelatedWorkRef-...:library_guide_ou.2"
         creator: "University of Oklahoma Libraries"
            desc: "This guide is designed to provide additional resources to help you study."
            icon: "resources/.../fd35e23767020999111e1f49239199b4c5eff23e.png"
           label: "Library Guide for Human Physiology"
            href: "http://guides.ou.edu/biol2124_humanphysiology"
    target-NTIID: "tag:nextthought.com,2011-10:NTI-UUID-dbbb93c8d79d8de6e1edcbe8685c07c9"
  targetMimeType: "application/vnd.nextthought.externallink"
*/

const CONTENT_TYPE = 'application/vnd.nextthought.content';
const EXTERNAL_TYPE = 'application/vnd.nextthought.externallink';

export default class RelatedWorkReference extends ContentTree(
	Completable(Pages(Base))
) {
	static MimeType = COMMON_PREFIX + 'relatedworkref';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'desc':               { type: 'string' },
		'href':               { type: 'string' },
		'icon':               { type: 'string' },
		'label':              { type: 'string' },
		'target':             { type: 'string' },
		'target-NTIID':       { type: 'string' },
		'targetMimeType':     { type: 'string' },
		'type':               { type: 'string' },
		'description':        { type: 'string' },
		'byline':             { type: 'string' },
		'TargetPublishState': { type: 'string' }
	};

	static fromID(service, id) {
		return new RelatedWorkReference(service, null, { NTIID: id });
	}

	constructor(service, parent, data) {
		if (!data.Creator || data.Creator === data.creator) {
			data.Creator = data.creator;
		}
		delete data.creator;
		super(service, parent, data);
	}

	get isContent() {
		return (
			[this.type, this.targetMimeType].some(x => x === CONTENT_TYPE) ||
			isNTIID(this.href)
		);
	}

	get isExternal() {
		return (
			[this.type, this.targetMimeType].some(x => x === EXTERNAL_TYPE) ||
			!isNTIID(this.href)
		);
	}

	get isDocument() {
		return !this.isContent && !this.isExternal;
	}

	get isEmbedableDocument() {
		const types = [this.type, this.targetMimeType];
		if (this.isExternal && types.every(x => x === EXTERNAL_TYPE)) {
			// We don't have a MimeType to lookup...
			// Just compare the extension
			return this.getFileExtensionFromHref() === 'pdf';
		}

		return !this.isDocument && types.some(x => mime.extension(x) === 'pdf');
	}

	get target() {
		return this['target-NTIID'];
	}

	pointsToId(id) {
		return this.target === id;
	}

	getUserData() {
		let store = this[UserData];
		let service = this[Service];
		let id = this.getID();

		if (!store) {
			store = this[UserData] = new UserDataStore(
				service,
				id,
				service.getContainerURL(
					id,
					REL_RELEVANT_CONTAINED_USER_GENERATED_DATA
				)
			);
		}

		return Promise.resolve(store); //in the future, this may need to be async...
	}

	getFileExtensionFor() {
		const ext = [this.type, this.targetMimeType].reduce(
			(a, x) => a || mime.extension(x),
			null
		);
		const isPlatformType = [this.type, this.targetMimeType].some(x =>
			/nextthought/i.test(x)
		);

		if (!ext && this.isExternal && isPlatformType) {
			return 'www';
		}

		if (!ext || ext === 'bin') {
			return this.getFileExtensionFromHref();
		}

		return ext;
	}

	getFileExtensionFromHref() {
		return extname(parseUrl(this.href).pathname)
			.replace(/\./, '')
			.toLowerCase();
	}

	resolveIcon(bundle) {
		const { icon, isContent } = this;

		if (icon || !isContent) {
			return icon;
		}

		const p = bundle.getPackage(this['target-NTIID']);

		return p && p.icon;
	}

	async getContentTreeChildrenSource() {
		if (!this.isContent && isNTIID(this.href)) {
			return null;
		}

		try {
			const course = this.parent('isCourse');
			const pageId = this.href;
			const page = await this[Service].getObject(pageId);

			const contentPackage = course
				? await course.getPackage(page.ContentPackageNTIID)
				: await this[Service].getObject(page.ContentPackageNTIID);

			if (!contentPackage || contentPackage.isRenderable) {
				return null;
			}

			const toc = await contentPackage.getTableOfContents();
			const node = toc.getNode(page.getID());

			return node.flatten().filter(n => {
				return n && n.id !== pageId && n.isTopic() && !n.isAnchor();
			});
		} catch (e) {
			return null;
		}
	}
}

Registry.register(RelatedWorkReference);
