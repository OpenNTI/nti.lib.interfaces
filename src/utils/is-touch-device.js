/*
 * @credits: http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
 */
const isTouchDevice = process.browser && (
	'ontouchstart' in global || // everyone else
	'onmsgesturechange' in global //IE10
	);

export default isTouchDevice;

export const PointerEvents = typeof PointerEvent !== 'undefined'
	? {
		pointerDown: 'pointerdown',
		pointerEnter: 'pointerenter',
		pointerLeave: 'pointerleave',
		pointerMove: 'pointermove',
		pointerOut: 'pointerout',
		pointerOver: 'pointerover',
		pointerUp: 'pointerup'
	}
	: isTouchDevice
		? {
			pointerDown: 'touchstart',
			pointerEnter: 'touchenter',
			pointerLeave: 'touchleave',
			pointerMove: 'touchmove',
			pointerOut: 'touchcancel',
			pointerOver: '-NA-',
			pointerUp: 'touchend'
		}
		: {
			pointerDown: 'mousedown',
			pointerEnter: 'mouseenter',
			pointerLeave: 'mouseleave',
			pointerMove: 'mousemove',
			pointerOut: 'mouseout',
			pointerOver: 'mouseover',
			pointerUp: 'mouseup'
		};
