var Environment = function(opts) {
	opts = opts || {};
	var ctxt = this;
	
	for (var p in opts) {
		this[p] = opts[p];
	}
	
	this.ticking = false;
	this.init();
	
};

Environment.prototype.init = function() {
	var ctxt = this;
	this.critters = [];
	this.kill_list = [];
	this.ticking = false;
	this.stage = new createjs.Stage(this.stage_id);
};

Environment.prototype.start = function() {
	var ctxt = this;
	createjs.Ticker.addEventListener("tick", function() { ctxt.tick(); });
	createjs.Ticker.setInterval(25);
};

Environment.prototype.addCrit = function(cfg) {
	var ctxt = this;
	cfg.environment = this;
	if (!cfg.x || !cfg.y) {
		var pos = this.randomPosition();
		cfg.x = pos.x;
		cfg.y = pos.y;
	}
	var crit = new Critter(cfg);
	crit.environment = this;
	this.critters.push(crit);
	this.stage.addChild(crit.getShape());
};

Environment.prototype.killCrit = function(crit) {
	for (var i = 0, l = this.critters.length; i < l; i++) {
		if (this.critters[i].id == crit.id) {
			this.kill_list.push(i);
			break;
		}
	}
};

Environment.prototype.tick = function() {
	if (this.ticking) {
		return;
	}
	this.ticking = true;
	
	var ctxt = this;
	for (var i = 0, l = ctxt.critters.length; i < l; i++) {
		var c = ctxt.critters[i];
		c.tick();
	}
	
	this.killEmAll();
	
	if (this.critters.length < 10) {
		//this.addCrit(new Critter());
	}
	
	this.stage.update();
	this.ticking = false;
};

Environment.prototype.killEmAll = function() {
	if (this.kill_list.length > 0) {
		this.kill_list.sort(function compare(a, b) {
			if (a > b) {
				return -1;
			}
			if (a < b) {
				return 1;
			}
			return 0;
		});
		
		//for (var i = this.kill_list.length - 1; i >= 0; i--) {
		for (var i = 0, l = this.kill_list.length; i < l; i++) {
			var crit = this.critters[this.kill_list[i]];
			//this.stage.removeChild(crit.shape);
			var stg_crit = this.stage.getChildByName(crit.id);
			console.log(crit.shape == stg_crit, crit, stg_crit);
			this.stage.removeChild(stg_crit);
			this.critters.splice(i, 1);
			//console.log('kill', i);
		}
		//console.log('----------');
		this.kill_list = [];
	}
};

Environment.prototype.randomPosition = function() {
	var w = this.stage.canvas.width;
	var h = this.stage.canvas.height;
	return {
		x: Math.round(Math.random() * w),
		y: Math.round(Math.random() * h)
	};
};

Environment.prototype.findAll = function(type, filter) {
	var matches = [];
	if (!Array.isArray(type)) {
		type = [type];
	}
	for (var i = 0, l = this.critters.length; i < l; i++) {
		var c = this.critters[i];
		for (var ti = 0, tl = type.length; ti < tl; ti++) {
			if (type[ti] == c.type) {
				matches.push(c);
				break;
			}
		}
	}
	
	return matches;
};
