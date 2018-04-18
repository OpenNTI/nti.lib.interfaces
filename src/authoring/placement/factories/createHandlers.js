import {Handlers} from '@nti/lib-commons';

function create (handles, subHandlers, useContainer) {
	const handlers = new Handlers(subHandlers);

	function getHandlerFor (item, container) {
		return handlers.getHandlerFor(useContainer ? container : item);
	}

	return {
		handles: handles,

		placeItemIn (item, container, scope) {
			const handler = getHandlerFor(item, container);

			return handler && handler.placeItemIn ?
				handler.placeItemIn(item, container, scope) :
				Promise.reject('No handler to place item in');
		},


		removeItemFrom (item, container, scope) {
			const handler = getHandlerFor(item, container);

			return handler && handler.removeItemFrom ?
				handler.removeItemFrom(item, container, scope) :
				Promise.reject('No handler to remove item from');
		}
	};
}

export function createHandlersFor (handles, subHandlers) {
	return create(handles, subHandlers);
}

export function createHandlers (subHandlers) {
	return create(null, subHandlers, true);
}
