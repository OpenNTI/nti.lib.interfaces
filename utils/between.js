function min(a, b) {
	return a < b ? a : b;
}


function max(a, b) {
	return a > b ? a : b;
}


export default function between(i, a, b, inclusive = false) {
	let x = min(a, b);
	let y = max(a, b);

	return inclusive ?
		(i >= x && i <= y) :
		(i > x && i < y);
}
