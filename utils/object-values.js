export default function (o) {
	return o && Object.keys(o).map(key => o[key]);
}
