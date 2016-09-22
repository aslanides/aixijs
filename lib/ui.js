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

	showAgentParams(params) {
		for (let k of ['alpha', 'gamma', 'epsilon', 'horizon', 'samples', 'ucb', 'cycles']) {
			this.getElementById('p_' + k).style.display = (k in params ? 'table-row' : 'none');

			let el = this.getElementById(k);
			el.required = (k in params);
			el.value = params[k] || 1;
		}

		this.getElementById('p_cycles').style.display = 'table-row';
	}

	showEnvParams(dem) {
		for (let p of dem.env.input_elements) {
			this.getElementById(p).style.display = 'table-row';
		}
	}

	start() {
		this.show('loading');
		this.show('cancel');
		this.hide('navigation');
		this.hide('run');
		this.slider = this.getElementById('slider');
	}

	end() {
		this.hide('loading');
		this.hide('cancel');
		this.show('navigation');
		this.show('run');
	}

	show(x) {
		this.getElementById(x).style.display = 'block';
	}

	hide(x) {
		this.getElementById(x).style.display = 'none';
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
			if (key == 'ucb' && val > 0) {
				continue;
			}

			if (key == 'cycles' ||
				key == 'horizon' ||
				key == 'samples') {
				if (isNaN(val) || val < 1) {
					console.error('Bad options.');
					return null;
				}
			} else if (isNaN(val) || val < 0 || val > 1) {
				console.error('Bad options.');
				return null;
			}
		}

		return options;
	}

	getConfig(dem) {
		let conf = dem.config ? Util.deepCopy(dem.config) : {};
		let disp = this.getElementById('p_dispensers');
		if (disp.style.display == 'table-row') {
			conf.goals = [];
			let children = disp.children;
			for (let child of children) {
				if (child.tagName == 'INPUT') {
					conf.goals.push({ freq: child.value });
				}
			}
		}

		conf.M = this.getElementById('dim').value;
		conf.N = conf.M;

		if (this.getElementById('p_opponent').style.display == 'table-row') {
			conf.opponent = IteratedPrisonersDilemma.opponents[this.getElementById('opponent_select').value];
		}

		return conf;
	}

	static init() {
		let menu = document.getElementById('demo_select');
		for (let o in demos) {
			let option = document.createElement('option');
			option.text = demos[o].name;
			menu.add(option);
		}

		menu = document.getElementById('opponent_select');
		for (let op in IteratedPrisonersDilemma.opponents) {
			let option = document.createElement('option');
			option.text = op;
			menu.add(option);
		}
	}
}
