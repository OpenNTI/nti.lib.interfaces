import { Service } from '../constants.js';

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
	canManageOwnedGroups: 'nti.platform.groups.can_manage_owned_groups',

	canShareRedaction: false,

	canAddCreditTypes() {
		return (
			this[Service]?.getCollection('CreditDefinitions', 'Global').accepts
				?.length > 0
		);
	},

	canSeeBlogs() {
		return Boolean(this[Service]?.getCollection('Blog'));
	},

	canRedact() {
		return !!this[Service]?.getCollectionFor(
			'application/vnd.nextthought.redaction',
			'Pages'
		);
	},

	canCanvasURL() {
		return !!this[Service]?.getCollectionFor(
			'application/vnd.nextthought.canvasurlshape',
			'Pages'
		);
	},

	canEmbedVideo() {
		return !!this[Service]?.getCollectionFor(
			'application/vnd.nextthought.embeddedvideo',
			'Pages'
		);
	},

	canImpersonate() {
		try {
			return (
				/@nextthought\.com$/.test(this[Service].getAppUsername()) &&
				this[Service].getAppUserSync().getLink('logon.nti.impersonate')
			);
		} catch {
			return false;
		}
	},
};

const list = Symbol('list');

export default class Capabilities {
	constructor(service, caps) {
		this[Service] = service;
		this[list] = caps || [];

		for (let cap of Object.keys(CAPABILITIES)) {
			let test = CAPABILITIES[cap];

			if (typeof test === 'string') {
				test = this.has(test);
			} else if (test.call) {
				test = test.call(this);
			}

			this[cap] = test;
		}
	}

	toJSON() {
		return this[list];
	}

	has(c) {
		return this[list].indexOf(c) >= 0;
	}
}
