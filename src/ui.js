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
		let md = this.doc.getElementById(`${exp}_exp`);
		try {
			md.style.display = 'block';
		} catch (e) { }
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
		let fixerino = (options, level, div) => {
			for (let field in options) {
				if (field == 'type' ||
					field == 'model' ||
					field == 'discount' ||
					field == 'discountParams' ||
					field == 'tracer' ||
					field == 'modelParametrization' ||
					field == 'opponent' ||
					field == 'dist' ||
					field == 'transitions' ||
					field == 'rewards' ||
					field == 'groups' ||
					field == 'numStates' ||
					field == 'numActions' ||
					field == 'plan_caching' ||
					field == 'state_percepts' ||
					field[0] == '_') {
					continue;
				}

				// TODO use a handler idiom here; this function is huge
				// probably the worst code i've written in my life

				if (field == 'discounts') {
					let p = this.doc.createElement('p');
					let select = this.doc.createElement('select');
					select.id = 'discount-select';
					for (let name in options.discounts) {
						let discount = options.discounts[name];
						let opt = this.doc.createElement('option');
						opt.value = discount.name;
						opt.text = discount.name;
						select.add(opt);
					}

					let label = this.doc.createElement('label');
					label.for = 'discount-select';
					label.innerText = 'Discount: ';

					p.appendChild(label);
					p.appendChild(select);
					p.name = field;
					div.appendChild(p);

					select.onchange = function () {
						for (let i = div.children.length - 1; i >= 0; i--) {
							let p = div.children[i];
							if (p.children[0].innerText.startsWith('agent.discount')) {
								div.removeChild(p);
							}
						}

						fixerino(options.discountParams[select.value], 'agent.discount', div);
					};

					fixerino(options.discountParams.GeometricDiscount, 'agent.discount', div);

					continue;
				}

				if (field == 'agents') {
					// make dropdown to pick agent
					let p = this.doc.createElement('p');
					let select = this.doc.createElement('select');
					select.id = 'agent-select';
					for (let name in options.agents) {
						let agent = options.agents[name];
						let opt = this.doc.createElement('option');
						opt.value = agent.name;
						opt.text = agent.name;
						select.add(opt);
					}

					let label = this.doc.createElement('label');
					label.for = 'agent-select';
					label.innerText = `Agent: `;

					p.appendChild(label);
					p.appendChild(select);
					p.name = field;
					div.appendChild(p);
					continue;
				}

				if (typeof options[field] == 'object') {
					fixerino(options[field], level, div);
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
				try {
					label.innerText = `${level}.${glossary[field].label}:`;
					label.title = glossary[field].description;
				} catch (e) {
					label.innerText = `${level}.${field}`;
					label.title = '';
				}

				p.appendChild(label);
				p.appendChild(input);
				p.name = field;
				div.appendChild(p);
			}
		};

		for (let opt of ['env', 'agent']) {
			let div = this.getElementById(opt);
			let options = config[opt];
			fixerino(options, opt, div);
		}
	}

	pull(options) {
		let matchOpt = (options, f, v) => {
			for (let field in options) {
				if (field == f) {
					options[field] = v;
					return;
				}

				if (typeof options[field] == 'object') {
					matchOpt(options[field], f, v);
				}
			}
		};

		for (let opt of ['env', 'agent']) {
			let div = this.getElementById(opt);
			for (let p of div.children) {
				let rofl = this.getElementById(p.name);

				if (p.name == 'agents') {
					options.agent.type = options.agent.agents[p.children[1].value];
					continue;
				}

				if (p.name == 'discounts') {
					options.agent.discount = options.agent.discounts[p.children[1].value];
					let dp = {};
					for (let p of div.children) {
						if (p.children[0].innerText.startsWith('agent.discount')) {
							dp[p.children[1].name] = p.children[1].value;
						}
					}

					options.agent.discountParam = dp;
					continue;
				}

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
		let i = 0;
		let row = null;
		for (let d in configs) {
			if (i % 5 == 0) {
				row = document.createElement('div');
				row.className = 'row';
				picker.appendChild(row);
			}

			let config = configs[d];
			if (!config.active) {
				continue;
			}

			i++;

			let a = document.createElement('a');
			a.href = '#';
			a.id = d;
			a.onclick = _ => demo.new(config);
			row.appendChild(a);

			let div = document.createElement('div');
			div.className = 'col-xs-2 thumbnail';
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
		let url = document.location.href.split('?');
		if (url.length != 2) {
			return;
		}
		let str = url[1];
		if (!configs[str]) {
			return;
		}

		document.getElementById(str).click();
	}
}
