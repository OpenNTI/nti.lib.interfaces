/**
 * RFC4122 version 4 compliant UUID generator.
 *
 * @see http://stackoverflow.com/a/8809472
 * @returns {string} A Globally Unique Identifier
 */
export default function guidGenerator() {
	/*eslint-disable no-bitwise*/
	let seed = Date.now();

	function next () {
		let result = (seed + Math.random() * 16) % 16 | 0;
		seed = Math.floor(seed / 16);//update seed
		return result;
	}

	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c)=> {
		let r = next();
		return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
	});
	/*eslint-enable no-bitwise*/
}
