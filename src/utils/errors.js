export class NoLinkError extends Error {
	code = 'NoLink';
	constructor(rel) {
		super(`No Link: ${rel}`);
		this.rel = rel;
	}
}

export class NotAvailableError extends Error {
	code = 'NotAvailable';
}
