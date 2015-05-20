var Environment = function(opts) {
	opts = opts || {};
	var ctxt = this;
	
	for (var p in opts) {
		this[p] = opts[p];
	}
	
	this.init();
	
};

Environment.prototype.init = function() {
	var ctxt = this;
	this.critters = [];
	this.stage = new createjs.Stage(this.stage_id);
	createjs.Ticker.addEventListener("tick", function() { ctxt.tick(); });
	createjs.Ticker.setInterval(25);
	this.stage.update();
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
	for (var i = this.critters.length - 1; i > 0; i--) {
		if (this.critters[i].id == crit.id) {
			this.stage.removeChild(crit.shape);
			this.critters.splice(i, 1);
			break;
		}
	}
};

Environment.prototype.tick = function() {
	var ctxt = this;
	for (var i = 0, l = ctxt.critters.length; i < l; i++) {
		var c = ctxt.critters[i];
		c.tick();
	}
	
	this.addCrit(new Critter());
	
	this.stage.update();
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
