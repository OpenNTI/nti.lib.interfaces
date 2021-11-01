import { buffer, ObjectUtils } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

const logger = Logger.get('user-preferences:root');

export default class PreferenceRoot extends Base {
	static MimeType = COMMON_PREFIX + 'preference.root';
	static ChangeBubbles = true;

	// prettier-ignore
	static Fields = {
		...super.Fields,
		'ChatPresence':      { type: 'model' },
		'Badges':            { type: 'model' },
		'Gradebook':         { type: 'model' },
		'PushNotifications': { type: 'model' },
		'Sort':              { type: 'model' },
		'WebApp':            { type: 'model' },
	};

	constructor(service, parent, data) {
		super(service, parent, data);
		this.on('change', this.#maybeSave);
	}

	#maybeSave = (_, ...args) => {
		// logger.info(bucket, args);

		/** @type {{buffer: number; changes: Set<string>}} */
		const stash = this.#maybeSave;
		/** @type {string} */
		const path = [...args].join('/');
		/** @type {Set<string>} */
		const changes = stash.changes || (stash.changes = new Set());
		const bucket = findMostSpecificKey(this, ...args);

		// The save method emits two changes. First the 'saving' and then all the keys in the response body...
		// the save() promise is not complete when these are emitted, so we can ignore them.
		if (/saving/.test(path) || stash.saving?.includes(bucket)) {
			return;
		}

		changes.add(bucket);

		buffer.inline(stash, 1000, async () => {
			logger.debug('preferences changed. saving');
			try {
				const localChanges = (stash.saving = [...changes])
					.sort()
					.filter(removeNested);
				changes.clear();

				for (let field of localChanges) {
					field = ObjectUtils.get(this, field);
					if (!field?.href) {
						logger.error(
							'Cannot save without an href property',
							field
						);
						continue;
					}

					// save the section of the preferences
					await field.save(
						field.getData({ diff: 'deep' }),
						null,
						'self'
					);
				}
			} catch (saveError) {
				if (saveError.statusCode !== 0) {
					logger.stack(saveError);
				}
			} finally {
				stash.saving = null;
			}
		});
	};
}

Registry.register(PreferenceRoot);

function findMostSpecificKey(scope, ...path) {
	const [root] = path;
	while (path.length > 1) {
		const key = path.join('.');

		if (ObjectUtils.get(scope, [key, 'href'].join('.'))) {
			return key;
		}

		path.pop();
	}

	return root;
}

function removeNested(value, index, array) {
	return index === 0 || !value.startsWith(array[index - 1]);
}
