const awaitSafely = async p => {
	try {
		await p;
	} catch (e) {
		//swallow
	}
};

export default {
	get isFlagged() {
		return this.hasLink('flag.metoo');
	},

	get isFlaggable() {
		return this.hasLink('flag') || this.hasLink('flag.metoo');
	},

	async flag() {
		await awaitSafely(this.flagging || Promise.resolve());

		const worker = (this.flagging = this.isFlagged
			? this.postToLink('flag.metoo')
			: this.postToLink('flag'));

		const resp = await worker;

		this.refresh(resp);
		this.onChange('isFlagged');
	},
};
