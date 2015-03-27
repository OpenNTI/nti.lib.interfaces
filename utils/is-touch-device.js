import isBrowser from './browser';

/* jshint -W101 *//*
 * @credits: http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
 */
const isTouchDevice = isBrowser && (
	'ontouchstart' in global || // everyone else
	'onmsgesturechange' in global //IE10
	);

export default isTouchDevice;
