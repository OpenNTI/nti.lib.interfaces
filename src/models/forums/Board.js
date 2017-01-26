import Base from '../Base';
import GetContents from '../../mixins/GetContents';
//import SharedWithList from '../../mixins/SharedWithList';


export default class Board extends Base {
	constructor (service, parent, data) {
		super(service, parent, data, GetContents/*, SharedWithList*/);
		// ForumCount: 1
		// description: ""
		// title: "Discussions"
	}
}
