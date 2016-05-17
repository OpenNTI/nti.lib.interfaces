const {max, min} = Math;

export default function between (i, a, b) {
	let x = min(a, b),
		y = max(a, b);
	return (i > x && i < y);
}

between.inclusive = function (i, a, b) {
	let x = min(a, b),
		y = max(a, b);
	return (i >= x && i <= y);
};
