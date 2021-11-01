import Registry, { COMMON_PREFIX } from '../Registry.js';
import Base from '../Base.js';

export default class Badge extends Base {
	static MimeType = [
		COMMON_PREFIX + 'badge',
		COMMON_PREFIX + 'openbadges.badge',
	];

	/* "Type": "Course",
	 * "alignment": null,
	 * "criteria": "https://ou-alpha.nextthought.com/course.cs1300.html",
	 * "description": "Completed all of the quizes with a 70% or more.",
	 * "href": "/dataserver2/...",
	 * "image": "https://...badge.png",
	 * "name": "Power and Elegance of Computational Thinking",
	 * "tags": [ "computer", "power" ]
	 */
	// prettier-ignore
	static Fields = {
		...super.Fields,
		'Type':        { type: 'string'   },
		'alignment':   { type: '*'        },
		'criteria':    { type: 'string'   },
		'description': { type: 'string'   },
		'image':       { type: 'string'   },
		'issuer':      { type: 'model'    },
		'name':        { type: 'string'   },
		'tags':        { type: 'string[]' },
	};
}

Registry.register(Badge);
