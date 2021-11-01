export type Constructor = new (...args: any[]) => {};

export type HandlerMapping<T> = {
	scope: any;
	[key: string]: string | T;
};
