import {mixin} from '@nti/lib-decorators';

import {Service} from '../../constants';
import Likable from '../../mixins/Likable';
import Base from '../Base';

export default
@mixin(Likable)
class Annotation extends Base {

	static Fields = {
		...Base.Fields,
		'AutoTags':               { type: '*'        },
		'ContainerId':            { type: 'string'   },
		'ContainerTitle':         { type: 'string'   },
		'ContainerMimeType':      { type: 'string'   },
		'ID':                     { type: 'string'   },
		'applicableRange':        { type: 'model'    },
		'sharedWith':             { type: 'string[]' },
		'presentationProperties': { type: '*'        },
		'prohibitReSharing':      { type: 'boolean'  },
		'tags':                   { type: 'string[]' },
	}

	constructor (service, parent, data) {
		super(service, parent, data);
	}


	getContainerID () {
		return this.ContainerId;
	}


	getContextData () {
		// return this[Service].get('/mobile/api/ugd/context-data/' + encodeURIComponent(this.getID()));
		return this[Service].getObject(this.getContainerID());
	}
}
