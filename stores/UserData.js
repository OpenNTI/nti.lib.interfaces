import {EventEmitter} from 'events';

import {Service, Pending} from '../CommonSymbols';

import {parseListFn} from './Library';

export default class UserData extends EventEmitter {

	constructor (service, rootContainerId, source) {
		let pending = [];

		this[Service] = service;
		this[Pending] = pending;
		this.loading = true;

		let parseList = parseListFn(this, service, pending);

		let bin = (bin, item) =>
			(this.Items[bin] = (this.Items[bin] || [])).push(item);

		let load = service.get(source).then(data=> {
			this.loading = false;
			Object.assign(this, data);

			this.Items = {root: []};

			for (let i of parseList(data.Items)) {
				let binId = i.getContainerID ? i.getContainerID() : 'root';
				bin(binId !== rootContainerId ? binId : 'root', i);
			}

			this.emit('load');
		});

		pending.push(load);

		this.on('load', ()=>console.log('Load: %o', this));
	}

}
