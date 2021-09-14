import { Markup, url } from '@nti/lib-commons';

import UserDataStore from '../../stores/UserData.js';
import {
	NO_LINK,
	REL_USER_GENERATED_DATA,
	REL_RELEVANT_CONTAINED_USER_GENERATED_DATA,
	Service,
	Parser as parse,
} from '../../constants.js';
import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

import Pages from './mixins/Pages.js';

const NOT_FOUND = { statusCode: 404, message: 'Not Found' };

const UserData = Symbol('UserData');
const ContentPackageMimeTypes =
	'application/vnd.nextthought.renderablecontentpackage';

export default class PageInfo extends Pages(Base) {
	static MimeType = COMMON_PREFIX + 'pageinfo';

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'AssessmentItems':     { type: 'model[]', defaultValue: [] },
		'ContentPackageNTIID': { type: 'string'                    },
		'label':               { type: 'string'                    },
		'sharingPreference':   { type: 'model'                     },
		'title':               { type: 'string'                    },
		'Title':               { type: 'string'                    },
		'RootURL':             { type: 'string'                    }
	}

	constructor(service, parent, data) {
		super(service, parent, data);

		if (this.AssessmentItems) {
			this.AssessmentItems = setupAssessmentItems(
				this.AssessmentItems,
				this
			);
		}
	}

	async getContentPackage() {
		const url = this.getLink('package');

		if (!url) {
			throw new Error(NO_LINK);
		}

		const raw = await this[Service].get({
			url,
			headers: {
				accept: ContentPackageMimeTypes,
			},
		});

		return this[parse](raw);
	}

	getContentRoot() {
		return url.resolve(this.getLink('content'), '.');
	}

	getContent() {
		let root = this.getContentRoot();

		return this.fetchLink('content').then(html =>
			Markup.rebaseReferences(html, root)
		);
	}

	getResource(url) {
		return this[Service].get(url);
	}

	getPackageID() {
		function bestGuess() {
			throw new Error('PageInfo does not declare the package ID.');
		}

		return this.ContentPackageNTIID || bestGuess(this);
	}

	getSharingPreferences() {
		const { sharingPreference: pref } = this;
		return pref
			? pref.waitForPending().then(() => pref)
			: Promise.resolve(void 0);
	}

	getAssessmentQuestion(questionId) {
		function find(found, item) {
			return (
				found ||
				//Find in Assignments/QuestionSets
				(item.getQuestion && item.getQuestion(questionId)) ||
				//or find the top-level question:
				(item.getID() === questionId && item)
			);
		}
		return (this.AssessmentItems || []).reduce(find, null);
	}

	async getUserDataLastOfType(mimeType) {
		const link = this.getLink(REL_USER_GENERATED_DATA);

		const o = {
			accept: mimeType,
			batchStart: 0,
			batchSize: 1,
			sortOn: 'lastModified',
			sortOrder: 'descending',
			filter: 'TopLevel',
		};

		if (!link) {
			throw new Error(NO_LINK);
		}

		return this.getResource(url.appendQueryParams(link, o))
			.then(objects => objects.Items[0] || Promise.reject(NOT_FOUND))
			.then(this[parse].bind(this));
	}

	getUserData() {
		let store = this[UserData];

		if (!store) {
			store = this[UserData] = new UserDataStore(
				this[Service],
				this.getID(),
				this.getLink(REL_RELEVANT_CONTAINED_USER_GENERATED_DATA)
			);

			this.addToPending(store.waitForPending());
		}

		return Promise.resolve(store); //in the future, this may need to be async...
	}

	resolveContentURL(_url) {
		const { RootURL } = this;
		const root = RootURL && url.parse(RootURL);

		return Promise.resolve(root ? root.resolve(_url) : _url);
	}

	insertNewDiscussion(discussion) {
		if (this[UserData]) {
			this[UserData].insertItem(discussion);
		}
	}
}

// AssessmentItem Setup functions -- defined here to stay out of the way.

/**
 * Puts AssessmentItems in order of:
 * 	1: Assignments
 * 	2: QuestionSets
 * 	3: Questions
 *
 * @param {Object} a left hand value
 * @param {Object} b right hand value
 * @returns {number} the comparison
 */
function assessmentItemOrder(a, b) {
	let order = (assessmentItemOrder.order = assessmentItemOrder.order || {
		'application/vnd.nextthought.assessment.assignment': 0,
		'application/vnd.nextthought.naquestionset': 1,
		'application/vnd.nextthought.naquestion': 2,
		'application/vnd.nextthought.nasurvey': 3,
		'application/vnd.nextthought.napoll': 4,
	});

	a = order[a.MimeType] || 5;
	b = order[b.MimeType] || 5;

	return a === b ? 0 : a < b ? -1 : 1;
}

function setupAssessmentItems(items, pageInfo) {
	items = items.filter(Boolean).sort(assessmentItemOrder);

	const sets = items.filter(o => o && o.containsId);

	//Remove questions & questionsets that are embedded within Assignments and QuestionSets...leave only top-level items.
	return items.filter(
		o =>
			!sets.reduce(
				(found, set) => found || set.containsId(o.getID()),
				null
			)
	);
}

Registry.register(PageInfo);
