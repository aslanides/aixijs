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

	clearParams() {
		let kek = this.getElementsByClassName('params');
		for (let k of kek) {
			k.style.display = 'none';
		}

		this.params = {};
		this.getElementById('p_cycles').style.display = 'table-row';
	}

	getDefaultParams(str, cl) {
		let lst = [];
		for (let ptr = cl; ptr; ptr = ptr.__proto__) {
			if (!ptr.params) {
				continue;
			}

			for (let p of ptr.params) {
				lst.push(p);
			}
		}

		let params = {};
		for (let i = lst.length - 1; i >= 0; i--) {
			params[lst[i].field] = lst[i].value;
		}

		this.params[str] = params;
	}

	showParams() {
		for (let cl in this.params) {
			let params = this.params[cl];
			for (let p in params) {
				let ell = this.getElementById(`p_${p}`);
				if (!ell) {
					continue;
				}

				ell.style.display = 'table-row';
				let el = this.getElementById(p);
				try {
					el.value = params[p];
					el.required = true;
				} catch (e) {}
			}
		}
	}

	getDemoParams(params) {
		for (let p in params) {
			for (let k in params[p]) {
				this.params[p][k] = params[p][k];
			}

		}
	}

	getOptions(opt, cl) {
		for (let p in this.params[cl]) {
			let el = this.getElementById(p);
			if (!el) {
				continue;
			}

			opt[p] = parseFloat(el.value);
		}
	}

	getConfig(dem) {
		let conf = dem.params.env ? Util.deepCopy(dem.params.env) : {};
		let disp = this.getElementById('p_freq');
		if (disp.style.display == 'table-row') {
			conf.goals = [];
			let children = disp.children;
			for (let child of children) {
				if (child.tagName == 'INPUT') {
					conf.goals.push({ freq: child.value });
				}
			}
		}

		conf.N = this.getElementById('N').value;

		if (this.getElementById('p_opponent').style.display == 'table-row') {
			conf.opponent = IteratedPrisonersDilemma.opponents[this.getElementById('opponent_select').value];
		}

		return conf;
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
			let dem = demos[d];
			if (!dem.active) {
				continue;
			}

			let a = document.createElement('a');
			a.href = '#';
			a.onclick = _ => demo.new(dem);
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
			h3.innerText = dem.name;
			caption.appendChild(h3);
			let para = document.createElement('p');
			para.innerText = dem.description;
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
