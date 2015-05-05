let clfmonth = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function dateString (str) {
	let pad = s=> (s <= 9 ? '0' : '') + s;

	let now = new Date();
	//now = now.toUTCString();

	let date = pad(now.getUTCDate());
	let hour = pad(now.getUTCHours());
	let mins = pad(now.getUTCMinutes());
	let secs = pad(now.getUTCSeconds());
	let year = now.getUTCFullYear();
	let month = clfmonth[now.getUTCMonth()];

	//10/Oct/2000:13:55:36 +0000
	now = `${date}/${month}/${year}:${hour}:${mins}:${secs} +0000`;

	return `- - [${now}] ${str}`;
}


class Logger {

	quiet() { this.noize = false; }

	info (str, ...args) {
		if (this.noize === false) { return; }

		console.log(dateString(str), ...args);
	}


	error (str, ...args) {
		if (str instanceof Error) {
			args.unshift(str);
			str = str.stack || str.message || (str+ '');

		}

		console.error(dateString(str), ...args);
	}


	debug (str, ...args) {
		if (this.noize === false) { return; }
		if (console.debug) {
			console.debug(dateString(str), ...args);
		} else {
			console.info(dateString(str), ...args);
		}
	}


	log (str, ...args) {
		console.log(dateString(str), ...args);
	}
}

export default new Logger();
