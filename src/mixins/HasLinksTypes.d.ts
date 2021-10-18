import Batch from '../data-sources/data-types/Batch';
import Base from '../models/Base';

export type ParseMode = 'parse' | 'batch' | 'raw';

export type ParseType<T = 'parse'> = T extends 'parse'
	? Base
	: T extends 'batch'
	? Batch
	: any;

export type HttpMethod = 'delete' | 'get' | 'head' | 'post' | 'put';
