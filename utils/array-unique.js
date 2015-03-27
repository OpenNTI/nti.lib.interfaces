const args = 'value, index, self';
/*jshint -W054*/
const filter = new Function(args, 'return self.indexOf(value) === index');
const filterLast = new Function(args, 'return self.lastIndexOf(value) === index');
/*jshint +W054*/

export default function unique(array, keepLastOccurance = false) {
    return array.filter(keepLastOccurance ? filterLast : filter);
}
