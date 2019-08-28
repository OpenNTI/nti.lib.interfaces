import EventEmitter from 'events';

export default class CommunityChannel extends EventEmitter {
	static fromForum (forum) {
		const save = forum.isModifiable ?
			async (data) => {
				await forum.save(data);
				return {title: forum.title, description: forum.description};
			} :
			null;

		const doDelete = forum.isModifiable ?
			() => forum.delete() :
			null;


		const addTopic = forum.canCreateTopic() ?
			(topic) => forum.createTopic(topic) :
			null;


		return new CommunityChannel({
			backer: forum,
			id: forum.getID(),
			title: forum.title,
			description: forum.description,
			contentsDataSource: forum.getContentsDataSource(),
			save,
			addTopic,
			delete: doDelete,
			reports: forum.Reports
		});
	}

	#backer = null
	#pinned = false
	#id = null
	#title = null
	#description = null
	#contentsDataSource = null
	#save = null
	#addTopic = null
	#doDelete = null
	#reports = null

	constructor ({backer, id, title, description, save, contentsDataSource, addTopic, pinned, delete: doDelete, reports}) {
		super();

		this.#backer = backer;
		this.#id = id;
		this.#pinned = pinned || false;
		this.#title = title;
		this.#description = description;
		this.#contentsDataSource = contentsDataSource;
		this.#save = save;
		this.#addTopic = addTopic;
		this.#doDelete = doDelete;
		this.#reports = reports;
	}

	get backer () { return this.#backer; }

	isCommunityChannel = true

	getID () { return this.#id; }

	get pinned () { return this.#pinned; }

	get title () { return this.#title; }
	get description () { return this.#description; }

	get Reports () { return this.#reports; }

	get contentsDataSource () { return this.#contentsDataSource; }

	get isModifiable () { return !!this.#save; }
	async save (data) {
		if (!this.isModifiable) { throw new Error('Cannot modifiy channel'); }

		const resp = await this.#save(data);
		const {title, description} = resp || {};

		this.#title = title || this.#description;
		this.#description = description || this.#description;
		this.emit('change');

		return resp;
	}


	get canAddTopic () { return !!this.#addTopic; }
	async addTopic (topic) {
		if (!this.canAddTopic) { throw new Error('Cannot add topic to channel'); }

		const newTopic = await this.#addTopic(topic);

		this.emit('item-added', newTopic);

		return newTopic;
	}


	get canDelete () { return !!this.#doDelete; }
	async delete () {
		if (!this.canDelete) { throw new Error('Cannot delete channel'); }

		await this.#doDelete();
		this.wasDeleted = true;
		this.emit('deleted');
	}

}
