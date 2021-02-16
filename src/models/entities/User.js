import { decorate } from '@nti/lib-commons';

import Achievements from '../../stores/Achievements';
import Stream from '../../stores/Stream';
import { Service, TOS_NOT_ACCEPTED } from '../../constants';
import { model, COMMON_PREFIX } from '../Registry';

import Entity from './Entity';

const LOAD_PROFILE_CACHE = Symbol('Load Profile Cache');

const ONLY_COMMUNITIES = x => x.isCommunity;

function cleanData(data) {
	let { accepting = [], following = [], ignoring = [] } = data;
	delete data.accepting;
	delete data.following;
	delete data.ignoring;
	delete data.AvatarURLChoices;
	delete data.Communities; //copy of DynamicMemberships & deprecated

	let toID = o => (/user/i.test(o.MimeType) ? o.Username : o.NTIID);

	data.Connections = {
		//Drop all exess data, just the ID is needed.
		accepting: accepting.map(toID),
		following: following.map(toID),
		ignoring: ignoring.map(toID),
	};
}

class User extends Entity {
	static MimeType = COMMON_PREFIX + 'user';

	// prettier-ignore
	static Fields = {
		...Entity.Fields,
		//Do not define "cleaned" fields (see cleanData)
		'Connections':        { type: '*'         },
		'DynamicMemberships': { type: 'model[]'   },
		'Reports':            { type: 'model[]'   },
		'positions':          { type: 'model[]'   },
		'education':          { type: 'model[]'   },
		'lastLoginTime':      { type: 'date'      },
		'backgroundURL':      { type: 'string'    },
		'location':           { type: 'string'    },
		'home_page':          { type: 'string'    },
		'twitter':            { type: 'string'    },
		'googlePlus':         { type: 'string'    },
		'instagram':          { type: 'string'    },
		'linkedIn':           { type: 'string'    },
		'facebook':           { type: 'string'    },
		'email':              { type: 'string'    },
		'role':               { type: 'string'    },
		'about':              { type: 'string[]'  },
		'interests':          { type: 'string[]'  },
		'lastSeenTime':       { type: 'date'      },
		'Deactivated':        { type: 'boolean'   }
	}

	isUser = true;

	constructor(service, data) {
		cleanData(data);
		super(service, null, data);

		if (this.isAppUser && this.hasLink(TOS_NOT_ACCEPTED)) {
			Object.assign(this, {
				acceptTermsOfService: () =>
					service.delete(this.getLink(TOS_NOT_ACCEPTED)),
			});
		}
	}

	getLastLoginTime() {} //implemented by lastLoginTime date field.

	getLastSeenTime() {} //implemented by lastSeenTime date field.

	applyRefreshedData(o) {
		cleanData(o);
		return super.applyRefreshedData(o);
	}

	get Communities() {
		console.trace('Who calls this? Stop it. :}'); //eslint-disable-line
		return this.DynamicMemberships;
	}

	get displayType() {
		return 'Person';
	}

	get firstName() {
		return this.NonI18NFirstName;
	}
	get lastName() {
		return this.NonI18NLastName;
	}

	get initials() {
		const firstLetter = x => (x || '')[0];
		const { displayName, firstName, lastName } = this;

		const names =
			firstName && lastName ? [firstName, lastName] : [displayName];
		return names.map(firstLetter).join('').trim();
	}

	get isAppUser() {
		let appUser = this[Service].getAppUsername();
		return this.getID() === appUser;
	}

	get following() {
		//do not define a setter.
		let service = this[Service];
		let contacts = service.getContacts();

		if (!contacts) {
			service.waitForPending().then(() => this.onChange('following'));
		}

		return contacts && contacts.contains(this, false);
	}

	/**
	 * Toggles the state of following.
	 *
	 * @returns {Promise} You can wait on the promise to refresh the UI
	 */
	follow() {
		let contacts = this[Service].getContacts();
		if (!contacts) {
			return Promise.reject('Not Ready, no Contact store');
		}

		let { following } = this;

		let pending = contacts[(following ? 'remove' : 'add') + 'Contact'](
			this
		);

		pending.then(() => this.onChange('following'));

		return pending;
	}

	async joinGroupWithCode(code) {
		const data = { invitation_codes: [code] };
		await this.postToLink('accept-invitations', data);
		this[Service].getGroups().load();
	}

	async isAllReadOnly(s) {
		const schema = s || (await this.getProfileSchema());
		const excludedFields = {
			password: true,
		};

		let isReadOnly = true;
		const fields = Object.values(schema);

		for (let i = 0; i < fields.length; i++) {
			if (!excludedFields[fields[i].name] && !fields[i].readonly) {
				isReadOnly = false;
				break;
			}
		}

		return isReadOnly;
	}

	getID() {
		return this.Username;
	}

	getAccountProfile() {
		if (!this[LOAD_PROFILE_CACHE]) {
			this[LOAD_PROFILE_CACHE] = this.fetchLink('account.profile');

			setTimeout(() => {
				delete this[LOAD_PROFILE_CACHE];
			}, 500);
		}

		return this[LOAD_PROFILE_CACHE];
	}

	getProfileType() {
		return this.getAccountProfile().then(account => account.ProfileType);
	}

	getProfileSchema() {
		return this.getAccountProfile().then(account => account.ProfileSchema);
	}

	preflightProfile(data) {
		return this.putToLink('account.profile.preflight', data);
	}

	getAchievements() {
		if (!this.hasLink('Badges')) {
			return Promise.reject('Badges not available');
		}

		return this.fetchLink('Badges').then(
			workspace => new Achievements(this[Service], this, workspace)
		);
	}

	getActivity() {
		let store = super.getActivity();
		let { Username } = this;
		let service = this[Service];

		if (this.isAppUser) {
			Object.assign(store, {
				postToActivity(body, title = '-', shareWith = null) {
					let { href } =
						service.getCollection('Blog', Username) || {};

					if (!href) {
						return Promise.reject('No Collection to post to.');
					}

					return service
						.postParseResponse(href, {
							MimeType:
								'application/vnd.nextthought.forums.personalblogentrypost',
							title,
							body,
						})

						.then(blogEntry => {
							let next = Promise.resolve();
							if (shareWith) {
								let others = shareWith.filter(x => !x.publish);
								let publish =
									others.length !== shareWith.length;
								next = blogEntry.share(publish, others);
							}

							return next.then(() => blogEntry);
						})

						.then(x => this.insert(x));
				},
			});
		}

		return store;
	}

	getMemberships() {
		if (!this.hasLink('memberships')) {
			return null;
		}

		return new Stream(this[Service], this, this.getLink('memberships'));
	}

	/**
	 * Get the communities this user is a member of.
	 *
	 * @param {boolean} excludeGroups Exclude DFL's from the result.
	 *
	 * @returns {array} List of Communities
	 */
	getCommunities(excludeGroups) {
		console.trace('Who calls this? Stop it. :}'); //eslint-disable-line
		let list = this.DynamicMemberships;
		return excludeGroups ? list.filter(ONLY_COMMUNITIES) : list;
	}
}

export default decorate(User, { with: [model] });
