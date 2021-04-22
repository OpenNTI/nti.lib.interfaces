import { buffer, decorate } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import { model, COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

const logger = Logger.get('user-preferences:root');

class PreferenceRoot extends Base {
	static MimeType = COMMON_PREFIX + 'preference.root';
	static ChangeBubbles = true;

	// prettier-ignore
	static Fields = {
		...Base.Fields,
		'ChatPresence':      { type: 'model' },
		'Gradebook':         { type: 'model' },
		'PushNotifications': { type: 'model' },
		'Sort':              { type: 'model' },
		'WebApp':            { type: 'model' },
	}

	constructor(service, parent, data) {
		super(service, parent, data);
		this.on('change', this.#maybeSave);
	}

	#maybeSave = (_, bucket, ...args) => {
		// logger.info(bucket, args);

		/** @type {{buffer: number; changes: Set<string>}} */
		const stash = this.#maybeSave;
		/** @type {string} */
		const path = [bucket, ...args].join('/');
		/** @type {Set<string>} */
		const changes = stash.changes || (stash.changes = new Set());

		// The save method emits two changes. First the 'saving' and then all the keys in the response body...
		// the save() promise is not complete when these are emitted, so we can ignore them.
		if (/saving/.test(path) || stash.saving?.includes(bucket)) {
			return;
		}

		changes.add(bucket);

		buffer.inline(stash, 1000, async () => {
			logger.debug('preferences changed. saving');
			try {
				const localChanges = (stash.saving = [...changes]);
				changes.clear();

				for (let field of localChanges) {
					field = this[field];
					if (!field.href) {
						logger.error(
							'Cannot save without an href property',
							field
						);
						continue;
					}

					// save the section of the preferences
					await field.save(field.toJSON(), null, 'self');
				}
			} catch (saveError) {
				logger.stack(saveError);
			} finally {
				stash.saving = null;
			}
		});
	};
}

export default decorate(PreferenceRoot, { with: [model] });
