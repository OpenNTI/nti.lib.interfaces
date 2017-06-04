import {parse as parseUrl} from 'url';
import {extname} from 'path';

import mime from 'mime-types';
import {isNTIID} from 'nti-lib-ntiids';

import UserDataStore from '../stores/UserData';
import {REL_RELEVANT_CONTAINED_USER_GENERATED_DATA, Service} from '../constants';

import {model, COMMON_PREFIX} from './Registry';
import Base from './Base';


const UserData = Symbol('UserData');

/*
Internal Links:
			NTIID: "tag:nextthought.com,2011-10:OU-RelatedWorkRef...:digestion_and_metabolism_textbook1"
		creator: "Openstax, Heather Ketchum, and Eric Bright"
			desc: "Read this material about Digestion and Metabolism."
			icon: "resources/.../fd35e23767020999111e1f49239199b4c5eff23e.png"
			label: "Digestion and Metabolism Textbook Reading 1"
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

@model
export default class RelatedWorkReference extends Base {
	static MimeType = COMMON_PREFIX + 'relatedworkrefpointer'

	static fromID (service, id) {
		return new RelatedWorkReference(service, {NTIID: id});
	}

	//Minimum keys required: NTIID. Links preferred.
	constructor (service, data) {
		if (!data.Creator || (data.Creator === data.creator)) {
			data.Creator = data.creator;
		}
		delete data.creator;
		super(service, null, data);
	}


	get isContent () {
		return [this.type, this.targetMimeType].some(x => x === CONTENT_TYPE)
			|| isNTIID(this.href);
	}


	get isExternal () {
		return [this.type, this.targetMimeType].some(x => x === EXTERNAL_TYPE)
			|| !isNTIID(this.href);
	}


	get isDocument () {
		return !this.isContent && !this.isExternal;
	}


	get isEmbeddableDocument () {
		return !this.isDocument && [this.type, this.targetMimeType].some(x => mime.extension(x) === 'pdf');
	}


	getUserData () {
		let store = this[UserData];
		let service = this[Service];
		let id = this.getID();

		if (!store) {
			store = this[UserData] = new UserDataStore(service, id,
				service.getContainerURL(id, REL_RELEVANT_CONTAINED_USER_GENERATED_DATA));
		}

		return Promise.resolve(store);//in the future, this may need to be async...
	}


	getFileExtentionFor () {
		const ext = [this.type, this.targetMimeType].reduce((a, x) => a || mime.extension(x), null);
		const isPlatformType = [this.type, this.targetMimeType].some(x => /nextthought/i.test(x));

		if (!ext && this.isExternal && isPlatformType) {
			return 'www';
		}

		if (!ext || ext === 'bin') {
			return extname(parseUrl(this.href).pathname).replace(/\./, '');
		}

		return ext;
	}


	resolveIcon (bundle) {
		const {icon, isContent} = this;

		if (icon || !isContent) {
			return icon;
		}

		const p = bundle.getPackage(this['target-NTIID']);

		return p && p.icon;
	}
}
