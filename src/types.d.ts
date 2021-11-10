export type Constructor = new (...args: any[]) => {};

export type HandlerMapping<T> = {
	scope: any;
	[key: string]: string | T;
};

import ModelBase from './models/Model';
import ServiceDoc from './stores/Service';
import { Link as LinkDef } from './utils/get-link.js';

export type Service = ServiceDoc;
export type Model = ModelBase;
export type Data = { [x: string]: any };
export type Link = LinkDef;
export type DateGetter = () => Date;
