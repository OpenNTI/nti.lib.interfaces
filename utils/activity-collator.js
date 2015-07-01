const HIGHLIGHT_GROUP = 'application/vnd.nextthought.collated-highlight-container';

const getTime = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const newContainer = () => ({MimeType: HIGHLIGHT_GROUP, Items: {}});

const isHighlight = RegExp.prototype.test.bind(/highlight/i);

export default function activityCollator (activity) {

	let output = [];
	let known = {};

	for (let item of activity) {
		if (!isHighlight(item.MimeType)) {
			output.push(item);
			continue;
		}

		let time = getTime(item.getCreatedTime());
		let group = known[time];

		if (!group) {
			group = known[time] = newContainer();
			output.push(group);
		}

		let {Items} = group;
		let {ContainerID} = item;

		let list = Items[ContainerID] = Items[ContainerID] || [];

		list.push(item);
	}

	return output;
}
