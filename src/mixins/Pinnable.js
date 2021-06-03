/**
 * @template {import('../constants').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class extends Base {
		static Fields = {
			...super.Fields,
			Pinned: { type: 'boolean' },
		};

		get isPinned() {
			return this.Pinned;
		}

		get isPinnable() {
			return this.hasLink('pin') || this.hasLink('unpin');
		}

		async pin() {
			const resp = await this.postToLink('pin');
			await this.refresh(resp);

			this.onChange('isPinned');
			this.emit('pinned');
		}

		async unpin() {
			const resp = await this.postToLink('unpin');
			await this.refresh(resp);

			this.onChange('isPinned');
			this.emit('unpinned');
		}

		togglePinned() {
			return this.isPinned ? this.unpin() : this.pin();
		}
	};
