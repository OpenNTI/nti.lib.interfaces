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
	canDoAdvancedEditing: 'nti.platform.courseware.advanced_editing',

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

		for (let cap of Object.keys(CAPABILITIES)) {

			let test = CAPABILITIES[cap];

			if (typeof test === 'string') {
				test = this.has(test);
			}
			else if (test.call) {
				test = test.call(this);
			}

			this[cap] = test;
		}
	}


	toJSON () {
		return this[list];
	}


	has (c) {
		return this[list].indexOf(c) >= 0;
	}
}
