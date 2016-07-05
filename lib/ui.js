class UI {
	constructor() {
		this.doc = document
		this.clearExplanations()
		this.getElementById("p_cycles").style.display="table-row"
	}
	getElementById(id) {
		return this.doc.getElementById(id)
	}
	getElementsByClassName(cl) {
		return this.doc.getElementsByClassName(cl)
	}
	showExplanation(exp) {
		var mds = this.getElementsByClassName("md")
		for (var md of mds) {
			if (md.id == exp + "_exp") {
				md.style.display = "block"
			}
		}
	}
	clearExplanations() {
		var mds = this.getElementsByClassName("md")
		for (var md of mds) {
			if (md.id.endsWith("_exp")) {
				md.style.display = "none"
			}
		}
	}
	toggleNav() {
		var nav = this.getElementById("navigation")
		var current = nav.style.display
		nav.style.display = current == "none" ? "block" : "none"
	}
	showAgentParams(params) {
		for (var k of ["alpha","gamma","epsilon","horizon","samples","ucb","cycles"]) {
			this.getElementById("p_" + k).style.display = (k in params ? "table-row" : "none")
			var el = this.getElementById(k)
			el.required = (k in params)
			el.value = params[k] || 1
		}
	}
	getOptions() {
		var options = new Options()
		var param_keys = ["alpha","gamma","epsilon","horizon","samples","ucb","cycles"]
		for (var key of param_keys) {
			if (this.getElementById("p_" + key).style.display != "table-row") {
				continue
			}
			var val = parseFloat(this.getElementById(key).value)
			options[key] = val
			if (key == "cycles" ||
				key == "horizon" ||
				key == "samples" ||
				key == "ucb") {
				if (isNaN(val) || val < 1) {
					return null
				}
			} else if (isNaN(val) || val < 0 || val > 1) {
				return null
			}
		}
		return options
	}
}
