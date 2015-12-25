import MediaTyper from 'media-typer';

const ANY = {
	type: '*',
	subtype: '*',
	suffix: '*'
};

function get (x) {
	try {
		return MediaTyper.parse(x);
	}
	catch (e) {
		if (x === '*/*') {
			return ANY;
		}
	}

	return void 0;
}

export default class MimeComparator {

	constructor (mime) {
		this.type = get(mime);
	}

	typeMatches (o) {
		return this.partMatches('type', o);
	}

	subTypeMatches (o) {
		return this.partMatches('subtype', o);
	}

	suffixMatches (o) {
		return this.partMatches('suffix', o);
	}

	partMatches (key, o) {
		let {type} = this;
		if (type === ANY || o === ANY) {
			return true;
		}

		return type && o && type[key] === o[key];
	}

	is (type) {
		type = get(type);
		if (type === ANY) {
			return true;
		}

		return this.typeMatches(type)
			&& this.subTypeMatches(type)
			&& this.suffixMatches(type);
	}


	toString () {
		let {type} = this;

		if (!type) { return 'invalid'; }

		if (type === ANY) { return '*/*'; }

		return MediaTyper.format(type);
	}
}
