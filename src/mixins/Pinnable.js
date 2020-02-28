export default function PinnableApplyer (targetModelClass) {
	Object.assign(targetModelClass.Fields, {
		'Pinned': {type: 'boolean'}
	});

	return {
		get isPinned () {
			return this.Pinned;
		},

		get isPinnable () {
			return this.hasLink('pin') || this.hasLink('unpin');
		},

		async pin () {
			const resp = await this.postToLink('pin');
			await this.refresh(resp);

			this.onChange('isPinned');
			this.emit('pinned');
		},

		async unpin () {
			const resp = await this.postToLink('unpin');
			await this.refresh(resp);

			this.onChange('isPinned');
			this.emit('unpinned');
		},

		togglePinned () {
			return this.isPinned ? this.unpin() : this.pin();
		},

		addPinChangeListener (fn) {
			const pin = () => fn(true);
			const unpin = () => fn(false);

			this.addListener('pinned', pin);
			this.addListener('unpinned', unpin);

			return () => {
				this.removeListener('pinned', pin);
				this.removeListener('unpinned', unpin);
			};
		}
	};
}