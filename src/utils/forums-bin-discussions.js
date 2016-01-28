/**
 * Takes two arrays of forums and bins then
 *
 *	1.) by for credit or open
 *	2.) by if they are for this section or the parent
 *
 * returns an object that looks like:
 *
 *	{
 *		ForCredit: {
 *			Section: {id: String, items: Array[Forum]},
 *			Parent: {id: String, items: Array[Forum]}
 *		},
 *		Open: {
 *			Section: {id: String, items: Array[Forum]},
 *			Parent: {id: String, items: Array[Forum]}
 *		},
 *		Other: ...(same as above)
 *	}
 *
 * @param  {object} section Object of forums in this section
 * @param  {object} parent  Object of forums in the parent if there are any
 * @return {object}        The binned forums
 */
export default function binDiscussions (section, parent) {
	let bins = {};

	function addTo (key, group) {

		let items = (group && group.Items) || [];
		for(let item of items) {
			let bin = item.getBin();
			if (!bins[bin]) {
				bins[bin] = {};
			}

			bin = bins[bin];
			if (!bin[key]) {
				bin[key] = {id: group.NTIID, forums: []};
			}

			if (bin[key].id !== group.NTIID) {
				console.error('Bad ID match'); //eslint-disable-line no-console
			}

			bin[key].forums.push(item);
		}
	}

	addTo('Section', section);
	addTo('Parent', parent);

	return bins;
}
