const PRIVATE = new WeakMap();

export const initPrivate = (x, o = {}) => PRIVATE.set(x, o);

export const getPrivate = x => PRIVATE.get(x);
