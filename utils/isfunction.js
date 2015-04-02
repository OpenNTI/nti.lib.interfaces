//var getClass = {}.toString;

//See: http://jsperf.com/alternative-isfunction-implementations/4
export default function isFunction(object) {
	//Very SLOW:
	//return object && getClass.call(object) === '[object Function]';

	//Very FAST:
	return typeof object === 'function';
}
