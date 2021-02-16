export default function maybeWait(x) {
	if (Array.isArray(x)) {
		return Promise.all(x.map(maybeWait));
	}

	return x && x.waitForPending ? x.waitForPending() : x;
}
