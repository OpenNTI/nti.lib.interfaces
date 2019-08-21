import EventEmitter from 'events';

export default class CommunityChannel extends EventEmitter {
	static fromForum (forum) {
		const setTitle = forum.isModifiable ?
			(title) => forum.save({title}) :
			null;

		const addTopic = forum.canCreateTopic() ?
			(topic) => forum.createTopic(topic) :
			null;

		return new CommunityChannel({
			backer: forum,
			id: forum.getID(),
			title: forum.title,
			contentsDataSource: forum.getContentsDataSource(),
			setTitle,
			addTopic,
		});
	}

	#backer = null
	#pinned = false
	#id = null
	#title = null
	#setTitle = null
	#contentsDataSource = null
	#addTopic = null

	constructor ({backer, id, title, setTitle, contentsDataSource, addTopic, pinned}) {
		super();

		this.#backer = backer;
		this.#id = id;
		this.#pinned = pinned || false;
		this.#title = title;
		this.#setTitle = setTitle;
		this.#contentsDataSource = contentsDataSource;
		this.#addTopic = addTopic;
	}

	get backer () { return this.#backer; }

	isCommunityChannel = true

	getID () { return this.#id; }

	get pinned () { return this.#pinned; }

	get title () { return this.#title; }

	get canSetTitle () { return !!this.#setTitle; }
	async setTitle (title) {
		if (!this.canSetTitle) { throw new Error('Cannot set title on channel'); }

		const newTitle = await this.#setTitle(title);

		this.#title = newTitle || title;
		this.emit('change');

		return newTitle || title;
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