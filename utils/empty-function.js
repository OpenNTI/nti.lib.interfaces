/*
 * Why?
 *
 * For every place we want to pass a no-op function, we write ()=>{} or function(){}, we are creating new
 * instances...bloating memory, and creating extra work for the garbage collector. Having one common empty
 * funciton gives us a clean way to conserve resources.
 */
export default Object.freeze(function() {});
