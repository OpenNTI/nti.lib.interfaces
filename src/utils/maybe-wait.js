export default function maybeWait(x) {
	if (Array.isArray(x)) {
		return Promise.all(x.map(maybeWait));
	}

	return x?.waitForPending?.() || x;
}
