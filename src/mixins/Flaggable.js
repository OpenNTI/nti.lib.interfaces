const awaitSafely = async p => {
	try {
		await p;
	} catch (e) {
		//swallow
	}
};

/**
 * @template {import('../constants').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class Flaggable extends Base {
		get isFlagged() {
			return this.hasLink('flag.metoo');
		}

		get isFlaggable() {
			return this.hasLink('flag') || this.hasLink('flag.metoo');
		}

		async flag() {
			await awaitSafely(this.flagging || Promise.resolve());

			const worker = (this.flagging = this.fetchLink({
				method: 'post',
				mode: 'raw',
				rel: this.isFlagged ? 'flag.metoo' : 'flag',
			}));

			const resp = await worker;

			this.refresh(resp);
			this.onChange('isFlagged');
		}
	};
