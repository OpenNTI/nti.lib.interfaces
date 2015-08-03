import values from './object-values';

export default function (o, val) {
	let v = o && values(o) || false;//force falsy to become literal False
	return v && v.indexOf(val) > -1;
}
