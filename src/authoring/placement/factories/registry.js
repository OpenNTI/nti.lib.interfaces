import {createHandlers} from './createHandlers';

const registry = [];

let handlerWrapper = null;

export function getHandlers () {
	return handlerWrapper || (handlerWrapper = createHandlers(registry));
}

export function register (item) {
	handlerWrapper = null;
	const items = Array.isArray(item) ? item : [item];
	registry.push(...items);
}
