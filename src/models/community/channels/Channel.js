import EventEmitter from 'events';

export default class CommunityChannel extends EventEmitter {
	static fromForum (forum) {
		const save = forum.isModifiable ?
			async (data) => {
				await forum.save(data);
				return {title: forum.title, description: forum.description};
			} :
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
		});
	}

	#backer = null
	#pinned = false
	#id = null
	#title = null
	#description = null
	#save = null
	#contentsDataSource = null
	#addTopic = null

	constructor ({backer, id, title, description, save, contentsDataSource, addTopic, pinned}) {
		super();

		this.#backer = backer;
		this.#id = id;
		this.#pinned = pinned || false;
		this.#title = title;
		this.#save = save;
		this.#contentsDataSource = contentsDataSource;
		this.#addTopic = addTopic;
	}

	get backer () { return this.#backer; }

	isCommunityChannel = true

	getID () { return this.#id; }

	get pinned () { return this.#pinned; }

	get title () { return this.#title; }

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

	get contentsDataSource () { return this.#contentsDataSource; }

	get canAddTopic () { return !!this.addTopic; }
	async addTopic (topic) {
		if (!this.canAddTopic) { throw new Error('Cannot add topic to channel'); }

		const newTopic = await this.#addTopic(topic);

		this.emit('item-added', newTopic);

		return newTopic;
	}

}