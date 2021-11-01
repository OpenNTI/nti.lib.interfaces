/**
 * @template {import('../types').Constructor} T
 * @param {T} Base
 * @mixin
 */
export default Base =>
	class ContentConstraints extends Base {
		static Fields = {
			...super.Fields,
			PublicationConstraints: { type: 'model' },
		};

		get contentIsConstrainable() {
			return true;
		}

		get contentIsConstrained() {
			//NOTE: Ideally this would be defined by the constraints model, but its
			//not currently. So we'll let the class mixing this in define how to check
			const isConstrained =
				!this.hasMetContentConstraints ||
				!this.hasMetContentConstraints();

			return isConstrained && !!this.PublicationConstraints;
		}

		contentIsConstrainedBy(itemOrId) {
			return (
				this.contentIsConstrained &&
				this.PublicationConstraints.hasConstraintFor(itemOrId)
			);
		}
	};
