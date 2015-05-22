var Environment = function(opts) {
	opts = opts || {};
	var ctxt = this;
	
	this.capacity = 100;
	this.paused = false;
	
	for (var p in opts) {
		this[p] = opts[p];
	}
	
	this.ticking = false;
	this.init();
	
};

var clone = function(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
};

Environment.prototype.init = function() {
	var ctxt = this;
	this.critters = [];
	this.kill_list = [];
	this.ticking = false;
	this.stage = new createjs.Stage(this.stage_id);
	this.stage.on("stagemouseup", function(evt) {
		ctxt.addCrit({x: evt.stageX, y: evt.stageY});
	})
};

Environment.prototype.start = function() {
	var ctxt = this;
	createjs.Ticker.addEventListener("tick", function() { ctxt.tick(); });
	createjs.Ticker.setInterval(25);
};

Environment.prototype.pause = function() {
	this.paused = !this.paused;
};

Environment.prototype.addCrit = function(cfg) {
	var ctxt = this;
	cfg = cfg || {};
	cfg.environment = this;
	//if (!cfg.x || !cfg.y) {
	//	var pos = this.randomPosition();
	//	cfg.x = pos.x;
	//	cfg.y = pos.y;
	//}
	var crit = new Critter(cfg);
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
	if (this.ticking || this.paused) {
		return;
	}
	this.ticking = true;
	
	var ctxt = this;
	for (var i = 0, l = ctxt.critters.length; i < l; i++) {
		var c = ctxt.critters[i];
		c.tick();
	}
	
	this.killEmAll();
	
	var this_round = 0;
	while (false && this.critters.length < this.capacity && this_round++ < 5) {
		var cfg = {};
		if (Math.random() > 0.8) { cfg = CTypes.bug(); }
		this.addCrit(cfg);
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
		
		for (var i = 0, l = this.kill_list.length; i < l; i++) {
			var crit = this.critters[this.kill_list[i]];
			if (!crit || !crit.shape || typeof crit.shape === 'undefined') {
				debugger;
			}
			this.stage.removeChild(crit.shape);
			//var stg_crit = this.stage.getChildByName(crit.id);
			
			// why are we sometimes not finding the right critter?
			//console.log('removing ' + crit.id, 'found? ', crit.shape == stg_crit);
			//if (crit.shape != stg_crit) {
			//	debugger;
			//}
			//this.stage.removeChild(crit.shape);
			//stg_crit = null;
			
			this.critters.splice(this.kill_list[i], 1);
			//console.log('kill', i);
		}
		//console.log('----------');
		this.kill_list = [];
	}
};

Environment.prototype.randomPosition = function() {
	var dims = this.dimensions();
	return {
		x: Math.round(Math.random() * dims.w),
		y: Math.round(Math.random() * dims.h)
	};
};

Environment.prototype.dimensions = function() {
	return {w: this.stage.canvas.width, h: this.stage.canvas.height};
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
