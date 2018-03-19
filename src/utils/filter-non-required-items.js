function filterItems (items) {
	return items.reduce((acc, item) => {
		const {CompletionRequired, Items: subItems} = item;
		const filteredItems = subItems && filterItems(subItems);

		if (CompletionRequired || (filteredItems && filteredItems.length)) {
			acc.push({
				...item,
				Items: filteredItems
			});
		}

		return acc;
	}, []);
}

/**
 * Recursively remove all items that aren't required
 *
 * @method  filterNonRequiredItems
 * @param  {object} item  the raw data to filter
 * @return {object}       the item but without non-required items
 */
export default function filterNonRequiredItems (item) {
	return {
		...item,
		Items: item.Items ? filterItems(item.Items) : item.Items
	};
}
