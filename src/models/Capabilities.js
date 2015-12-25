import {Service} from '../constants';

const CAPABILITIES = {
	canUploadAvatar: 'nti.platform.customization.avatar_upload',
	canBlog: 'nti.platform.blogging.createblogentry',
	canChat: 'nti.platform.p2p.chat',
	canShare: 'nti.platform.p2p.sharing',
	canFriend: 'nti.platform.p2p.friendslists',
	canHaveForums: 'nti.platform.forums.communityforums',
	canChangePassword: 'nti.platform.customization.can_change_password',
	canCreateLists: 'nti.platform.p2p.friendslists',
	canCreateGroups: 'nti.platform.p2p.dynamicfriendslists',

	canShareRedaction: false,

	canSeeBlogs () {
		return Boolean(this[Service].getCollection('Blog'));
	},

	canRedact () {
		return !!this[Service].getCollectionFor(
			'application/vnd.nextthought.redaction',
			'Pages');
	},

	canCanvasURL () {
		return !!this[Service].getCollectionFor(
			'application/vnd.nextthought.canvasurlshape',
			'Pages');
	},

	canEmbedVideo () {
		return !!this[Service].getCollectionFor(
			'application/vnd.nextthought.embeddedvideo',
			'Pages');
	}

};


const list = Symbol('lsit');

export default class Capabilities {
	constructor (service, caps) {
		this[Service] = service;
		this[list] = caps || [];

		for (let cap in CAPABILITIES) {
			if (!CAPABILITIES.hasOwnProperty(cap)) { continue; }
			let test = CAPABILITIES[cap];

			if (typeof test === 'string') {
				test = this.hasCapability(test);
			}
			else if (test.call) {
				test = test.call(this);
			}

			this[cap] = test;
		}
	}


	hasCapability (c) {
		return this[list].indexOf(c) >= 0;
	}
}
