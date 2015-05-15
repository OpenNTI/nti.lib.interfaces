import {EventEmitter} from 'events';

import mixin from '../utils/mixin';

import Pendability from '../models/mixins/Pendability';

import {Service} from '../CommonSymbols';

import {parseListFn} from './Library';

export default class UserData extends EventEmitter {

	constructor (service, rootContainerId, source) {
		super();
		mixin(this, Pendability);
		this[Service] = service;

		this.loading = true;

		let parseList = parseListFn(this, service);

		let bin = (name, item) =>
			(this.Items[name] = (this.Items[name] || [])).push(item);

		let start = Date.now();
		let load = service.get(source).then(data=> {
			this.loading = false;
			Object.assign(this, data);

			this.Items = {root: []};

			for (let i of parseList(data.Items)) {
				let binId = i.getContainerID ? i.getContainerID() : 'root';
				bin(binId !== rootContainerId ? binId : 'root', i);
			}

			this.emit('load', `${(Date.now() - start)}ms`);
		});

		this.addToPending(load);

		this.on('load', time => console.log('Load: %s %o', time, this));
	}

}
