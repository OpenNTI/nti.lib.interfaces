import {parse} from '../models/Parser';
import {decodeFromURI} from '../utils/ntiids';

import {Service} from '../CommonSymbols';

export default class Forums {
	constructor(service) {
		this[Service] = service;
	}

	//TODO: refactor to get rid of this method.
	getObject (ntiid) {
		//the decoding should happen on the app side... no method in *this* project should know about 'pretty' encoded NTIIDs.
		ntiid = decodeFromURI(ntiid);

		//We should probably have the service parse the object by default... making this method redundant.
		return this[Service].getParsedObject(ntiid);
	}

	getObjects(ntiids) {
		return this[Service].getParsedObjects(ntiids);
	}

	reportItem (o) {
		let link = o && o.getLink && o.getLink('flag') || o.getLink('flag.metoo');
		if (!link) {
			return Promise.reject('Item has neither flag nor flag.metoo link.');
		}
		return this[Service].post(link)
				.then(obj => parse(this[Service], this, obj));
	}
}
