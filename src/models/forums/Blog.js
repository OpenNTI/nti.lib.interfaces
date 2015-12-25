import Board from './Board';


export default class Blog extends Board {
	constructor (service, parent, data) {
		delete data.title;
		super(service, parent, data);
	}

	get title () { return 'Thoughts'; }
}
