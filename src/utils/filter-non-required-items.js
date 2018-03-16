/**
 * Recursively remove all items that aren't required
 *
 * @method  filterNonRequiredItems
 * @param  {object} item  the raw data to filter
 * @return {object}       the item but without non-required items
 */
export default function filterNonRequiredItems (item) {
	const {CompletionRequired, Items:items} = item;
	const filteredItems = items && items.map(x => filterNonRequiredItems(x)).filter (x => !!x);

	if (CompletionRequired || (filteredItems && filteredItems.length)) {
		return {
			...item,
			Items: filteredItems
		};
	}

	return null;
}
