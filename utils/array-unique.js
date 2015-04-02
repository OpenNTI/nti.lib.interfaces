const args = 'value, index, self';
/*eslint-disable no-new-func*/
const filter = new Function(args, 'return self.indexOf(value) === index');
const filterLast = new Function(args, 'return self.lastIndexOf(value) === index');
/*eslint-enable no-new-func*/

export default function unique(array, keepLastOccurance = false) {
	return array.filter(keepLastOccurance ? filterLast : filter);
}
