import EventEmitter from 'events';
export default class PagedIterator extends EventEmitter {

	#parts = [];
	#loads = [];
	#index = 0;
	#loader = null;

	constructor (dataSource, params) {
		super();
		this.#loader = () => dataSource.loadPage?.(0, params) ?? dataSource.load(params);
	}

	get hasMore () {
		const p = this.#parts;
		return this.#loads.length === 0 || p[p.length - 1]?.hasMore;
	}

	more = async () => {
		const loads = this.#loads;
		const parts = this.#parts;
		if (!this.#loader) {
			return;
		}

		const lock = [];
		const idx = (this.#index++);
		this.#parts[idx] = lock;

		const load = this.#loader();
		this.#loader = null;
		loads.push(load);

		await Promise.all(loads); // force waterfall

		try {
			const data = await load;
			if (parts[idx] === lock) {
				parts[idx] = data;
				if (data.loadNextPage) {
					this.#loader = () => data.loadNextPage();
				}
				this.emit('change');
			}
		} catch (e) {
			if (parts[idx] === lock) {
				throw e;
			}
		}
	}

	clear () {
		const {length} = this.#parts;
		this.#parts.splice(0, length);
		this.#index = 0;
	}


	[Symbol.iterator] () {
		if (this.#index === 0 && this.#loads.length === 0) {
			this.more();
		}
		const i = this.#parts.reduce((a, n) => [...a, ...(n || [])], []);
		return i[Symbol.iterator]();
	}

}
