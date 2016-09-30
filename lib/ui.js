class UI {
	constructor() {
		this.doc = document;
		this.params = {};
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

	clear() {
		for (let opt of ['env', 'agent']) {
			let div = this.getElementById(opt);
			while (div.firstChild) {
				div.removeChild(div.firstChild);
			}
		}
	}

	push(config) {
		let fixerino = (options, div) => {
			for (let field in options) {
				if (field == 'type' ||
						field == 'model' ||
						field == 'discount') {
					continue;
				}

				if (typeof options[field] == 'object') {
					fixerino(options[field], div);
					continue;
				}

				let p = this.doc.createElement('p');
				let input = this.doc.createElement('input');

				input.type = 'number';
				input.className = 'param';
				input.name = field;
				input.id = field;
				input.value = options[field];
				input.required = true;
				input.min = Number.NEGATIVE_INFINITY;
				input.max = Number.POSITIVE_INFINITY;
				input.step = '0.01';

				let label = this.doc.createElement('label');
				label.for = field;
				label.innerText = field;

				p.appendChild(label);
				p.appendChild(input);
				p.name = field;
				div.appendChild(p);
			}
		};

		for (let opt of ['env', 'agent']) {
			let div = this.getElementById(opt);
			let options = config[opt];
			fixerino(options, div);
		}
	}

	pull(options) {
		let matchOpt = (options, f, v) => {
			for (let field in options) {
				if (field == f) {
					options[field] = v;
					return;
				}

				if (typeof field == 'object') {
					matchOpt(options[field], f, v);
				}
			}
		};

		for (let opt of ['env', 'agent']) {
			let div = this.getElementById(opt);
			for (let p of div.children) {
				let rofl = this.getElementById(p.name);
				matchOpt(options[opt], p.name, parseFloat(rofl.value));
			}
		}
	}

	start() {
		this.show('loading');
		this.show('cancel');
		this.hide('navigation');
		this.show('plots');
		this.hide('run');
		this.hide('back');
		this.slider = this.getElementById('slider');
	}

	end() {
		this.hide('loading');
		this.hide('cancel');
		this.show('navigation');
		this.show('run');
		this.show('back');
	}

	show(x) {
		this.getElementById(x).style.display = 'block';
	}

	hide(x) {
		this.getElementById(x).style.display = 'none';
	}

	static init() {
		let picker = document.getElementById('picker');
		for (let d in demos) {
			let config = demos[d];
			if (!config.active) {
				continue;
			}

			let a = document.createElement('a');
			a.href = '#';
			a.onclick = _ => demo.new(config);
			picker.appendChild(a);

			let div = document.createElement('div');
			div.className = 'col-md-2 thumbnail';
			a.appendChild(div);

			let img = document.createElement('img');
			img.src = `assets/thumbs/${d}.png`;
			img.alt = '...';
			div.appendChild(img);

			let caption = document.createElement('div');
			caption.className = 'caption';
			let h3 = document.createElement('h3');
			h3.innerText = config.name;
			caption.appendChild(h3);
			let para = document.createElement('p');
			para.innerText = config.description;
			caption.appendChild(para);
			div.appendChild(caption);
		}

		let menu = document.getElementById('opponent_select');
		for (let op in IteratedPrisonersDilemma.opponents) {
			let option = document.createElement('option');
			option.text = op;
			menu.add(option);
		}
	}
}
