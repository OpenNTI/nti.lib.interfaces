import { getHandlers } from './registry';

const refresh = item => item.refresh().then(() => item.onChange());

export function placeItemIn(item, container, scope) {
	return getHandlers()
		.placeItemIn(item, container, scope)
		.then(() => refresh(item)) //Refresh to get the newest shared counts
		.then(() => void 0);
}

export function removeItemFrom(item, container, scope) {
	return getHandlers()
		.removeItemFrom(item, container, scope)
		.then(() => refresh(item)) //Refresh to get the newest shared counts
		.then(() => void 0);
}
