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
		var md = this.doc.getElementById(`${exp}_exp`);
		try {
			md.style.display = 'block';
		} catch (e) {}
	}

	clearExplanations() {
		var mds = this.getElementsByClassName('md');
		for (var md of mds) {
			if (md.id.endsWith('_exp')) {
				md.style.display = 'none';
			}
		}
	}

	clear() {
		for (var opt of ['env', 'agent']) {
			var div = this.getElementById(opt);
			while (div.firstChild) {
				div.removeChild(div.firstChild);
			}
		}
	}

	push(config) {
		var fixerino = (options, level, div) => {
			for (var field in options) {
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
						field[0] == '_') {
					continue;
				}

				// TODO use a handler idiom here; this function is huge
				// probably the worst code i've written in my life

				if (field == 'discounts') {
					var p = this.doc.createElement('p');
					var select = this.doc.createElement('select');
					select.id = 'discount-select';
					for (var name in options.discounts) {
						var discount = options.discounts[name];
						var opt = this.doc.createElement('option');
						opt.value = discount.name;
						opt.text = discount.name;
						select.add(opt);
					}

					var label = this.doc.createElement('label');
					label.for = 'discount-select';
					label.innerText = 'Discount: ';

					p.appendChild(label);
					p.appendChild(select);
					p.name = field;
					div.appendChild(p);

					select.onchange = function () {
						for (var i = div.children.length - 1; i >= 0; i--) {
							var p = div.children[i];
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
					var p = this.doc.createElement('p');
					var select = this.doc.createElement('select');
					select.id = 'agent-select';
					for (var name in options.agents) {
						var agent = options.agents[name];
						var opt = this.doc.createElement('option');
						opt.value = agent.name;
						opt.text = agent.name;
						select.add(opt);
					}

					var label = this.doc.createElement('label');
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

				var p = this.doc.createElement('p');
				var input = this.doc.createElement('input');

				input.type = 'number';
				input.className = 'param';
				input.name = field;
				input.id = field;
				input.value = options[field];
				input.required = true;
				input.min = Number.NEGATIVE_INFINITY;
				input.max = Number.POSITIVE_INFINITY;
				input.step = '0.01';

				var label = this.doc.createElement('label');
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

		for (var opt of ['env', 'agent']) {
			var div = this.getElementById(opt);
			var options = config[opt];
			fixerino(options, opt, div);
		}
	}

	pull(options) {
		var matchOpt = (options, f, v) => {
			for (var field in options) {
				if (field == f) {
					options[field] = v;
					return;
				}

				if (typeof options[field] == 'object') {
					matchOpt(options[field], f, v);
				}
			}
		};

		for (var opt of ['env', 'agent']) {
			var div = this.getElementById(opt);
			for (var p of div.children) {
				var rofl = this.getElementById(p.name);

				if (p.name == 'agents') {
					options.agent.type = options.agent.agents[p.children[1].value];
					continue;
				}

				if (p.name == 'discounts') {
					options.agent.discount = options.agent.discounts[p.children[1].value];
					var dp = {};
					for (var p of div.children) {
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
		var $picker = $('#picker');
		var i = 0;
		var row = null;
		for (var d in configs) {
			if (i % 5 == 0) {
				row = document.createElement('div');
				row.className = 'row';
				picker.appendChild(row);
			}

			var config = configs[d];
			if (!config.active) {
				continue;
			}

			i++;

			var a = document.createElement('a');
			a.href = '#';
			a.onclick = _ => demo.new(config);
			row.appendChild(a);

			var div = document.createElement('div');
			div.className = 'col-xs-2 thumbnail';
			a.appendChild(div);

			var img = document.createElement('img');
			img.src = `assets/thumbs/${d}.png`;
			img.alt = '...';
			div.appendChild(img);

			var caption = document.createElement('div');
			caption.className = 'caption';
			var h3 = document.createElement('h3');
			h3.innerText = config.name;
			caption.appendChild(h3);
			var para = document.createElement('p');
			para.innerText = config.description;
			caption.appendChild(para);
			div.appendChild(caption);
		}
	}
}
