const importAll = x => x.keys().forEach(x);

importAll(require.context('../interface/', true, /\.js$/));
importAll(require.context('../models/', true, /\.js$/));
importAll(require.context('../session/', true, /\.js$/));
importAll(require.context('../stores/', true, /\.js$/));
importAll(require.context('../utils/', true, /\.js$/));

//TODO: refactor code under '../lib'
// importAll('../lib/');
