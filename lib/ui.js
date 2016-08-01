class UI {
	constructor() {
		this.doc = document;
	}

	getElementById(id) {
		return this.doc.getElementById(id);
	}

	getElementsByClassName(cl) {
		return this.doc.getElementsByClassName(cl);
	}

	showExplanation(exp) {
		let mds = this.getElementsByClassName('md');
		for (let md of mds) {
			if (md.id == exp + '_exp') {
				md.style.display = 'block';
			}
		}
	}

	clearExplanations() {
		let mds = this.getElementsByClassName('md');
		for (let md of mds) {
			if (md.id.endsWith('_exp')) {
				md.style.display = 'none';
			}
		}
	}

	showNav() {
		this.getElementById('navigation').style.display = 'block';
	}

	showAgentParams(params) {
		for (let k of ['alpha', 'gamma', 'epsilon', 'horizon', 'samples', 'ucb', 'cycles']) {
			this.getElementById('p_' + k).style.display = (k in params ? 'table-row' : 'none');
			let el = this.getElementById(k);
			el.required = (k in params);
			el.value = params[k] || 1;
		}

		this.getElementById('p_cycles').style.display = 'table-row';
	}

	toggleSpinner() {
		let spinz = this.doc.getElementById('spinz');
		if (spinz.style.display == 'none') {
			spinz.style.display = 'block';
		} else {
			spinz.style.display = 'none';
		}
	}

	getOptions() {
		let options = new Options();
		let keys = ['alpha', 'gamma', 'epsilon', 'horizon', 'samples', 'ucb', 'cycles'];
		for (let key of keys) {
			if (this.getElementById('p_' + key).style.display != 'table-row') {
				continue;
			}

			let val = parseFloat(this.getElementById(key).value);
			options[key] = val;
			if (key == 'cycles' ||
				key == 'horizon' ||
				key == 'samples' ||
				key == 'ucb') {
				if (isNaN(val) || val < 1) {
					return null;
				}
			} else if (isNaN(val) || val < 0 || val > 1) {
				return null;
			}
		}

		return options;
	}

	static init() {
		let menu = document.getElementById('demo_select');
		for (let o in demos) {
			let option = document.createElement('option');
			option.text = demos[o].name;
			menu.add(option);
		}
	}
}
