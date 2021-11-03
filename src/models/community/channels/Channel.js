import { defineReadOnly } from '@nti/lib-commons';

import { BaseObservable } from '../../AbstractModel.js';
import Iterator from '../../../data-sources/Iterator.js';

export default class CommunityChannel extends BaseObservable {
	static fromForum(forum, section = null) {
		const save = forum.isModifiable
			? async data => {
					await forum.save(data);
					return {
						title: forum.title,
						description: forum.description,
					};
			  }
			: null;

		const doDelete = forum.isModifiable ? () => forum.delete() : null;

		const addDiscussion = forum.canCreateTopic()
			? topic => forum.createTopic(topic)
			: null;

		return new CommunityChannel({
			backer: forum,
			id: forum.getID(),
			title: forum.title,
			description: forum.description,
			contentsDataSource: forum.getContentsDataSource(),
			save,
			addDiscussion,
			delete: doDelete,
			reports: forum.Reports,
			DefaultSharedToNTIIDs: forum.DefaultSharedToNTIIDs,
			DefaultSharedToDisplayNames: forum.DefaultSharedToDisplayNames,
			section,
		});
	}

	#backer = null;
	#pinned = false;
	#id = null;
	#title = null;
	#description = null;
	#contentsDataSource = null;
	#save = null;
	#addDiscussion = null;
	#doDelete = null;
	#reports = null;
	#DefaultSharedToNTIIDs = null;
	#DefaultSharedToDisplayNames = null;

	constructor({
		backer,
		id,
		title,
		description,
		save,
		contentsDataSource,
		addDiscussion,
		pinned,
		delete: doDelete,
		reports,
		DefaultSharedToNTIIDs,
		DefaultSharedToDisplayNames,
		section,
	}) {
		super();

		this.#backer = backer;
		this.#id = id;
		this.#pinned = pinned || false;
		this.#title = title;
		this.#description = description;
		this.#contentsDataSource = contentsDataSource;
		this.#save = save;
		this.#addDiscussion = addDiscussion;
		this.#doDelete = doDelete;
		this.#reports = reports;
		this.#DefaultSharedToNTIIDs = DefaultSharedToNTIIDs;
		this.#DefaultSharedToDisplayNames = DefaultSharedToDisplayNames;

		Object.defineProperty(this, 'section', defineReadOnly(section, true));
	}

	get backer() {
		return this.#backer;
	}

	get isCommunityChannel() {
		return true;
	}

	getID() {
		return this.#id;
	}

	get pinned() {
		return this.#pinned;
	}

	get title() {
		return this.#title;
	}
	get description() {
		return this.#description;
	}

	get Reports() {
		return this.#reports;
	}

	get contentsDataSource() {
		return this.#contentsDataSource;
	}

	getIterable(params) {
		return new Iterator(this.contentsDataSource, params);
	}

	containsPost(item) {
		const itemContainer = item?.ContainerId;

		if (!itemContainer) {
			return false;
		}

		return [this.getID(), this.backer?.getID(), this.backer?.NTIID].some(
			id => id === itemContainer
		);
	}

	loadPinnedContents(params) {
		const { contentsDataSource } = this;

		return contentsDataSource.loadPage(0, {
			sortOn: 'CreatedTime',
			sortOrder: 'descending',
			filter: 'Pinned',
			...params,
		});
	}

	get isModifiable() {
		return !!this.#save;
	}
	async save(data) {
		if (!this.isModifiable) {
			throw new Error('Cannot modifiy channel');
		}

		const resp = await this.#save(data);

		if ('title' in resp) {
			this.#title = resp.title;
		}

		if ('description' in resp) {
			this.#description = resp.description;
		}

		this.emit('change');

		return resp;
	}

	get canAddDiscussion() {
		return !!this.#addDiscussion;
	}
	async addDiscussion(payload) {
		if (!this.canAddDiscussion) {
			throw new Error('Cannot add discussions to channel');
		}

		const newDiscussion = await this.#addDiscussion(payload);

		this.emit('item-added', newDiscussion);

		return newDiscussion;
	}

	get canDelete() {
		return !!this.#doDelete;
	}
	async delete() {
		if (!this.canDelete) {
			throw new Error('Cannot delete channel');
		}

		await this.#doDelete();
		this.wasDeleted = true;
		this.emit('deleted');
	}

	getDefaultSharing() {
		return {
			scopes: this.#DefaultSharedToNTIIDs ?? [],
			displayNames: this.#DefaultSharedToDisplayNames,
			locked: true,
		};
	}
}
