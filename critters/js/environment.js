var EnvironmentClass = Class.extend({
	
	constructor: function(opts) {
		opts = opts || {};
		var ctxt = this;
		
		this.capacity = 100;
		this.paused = false;
		
		for (var p in opts) {
			this[p] = opts[p];
		}
		
		this.ticking = false;
		this.init();
	},
	
	tick: function() {
		if (this.ticking || this.paused) {
			return;
		}
		this.ticking = true;
		
		var ctxt = this;
		for (var i = 0, l = ctxt.critters.length; i < l; i++) {
			var c = ctxt.critters[i];
			if (c.id == this.watch_id) {
				debugger;
			}
			c.tick();
		}
		
		this.killEmAll();
		
		var this_round = 0;
		//while (false && this.critters.length < this.capacity && this_round++ < 5) {
		//	var cfg = {};
		//	if (Math.random() > 0.8) { cfg = CTypes.bug(); }
		//	this.addCrit(cfg);
		//}
		
		this.stage.update();
		this.ticking = false;
	},
	
	init: function() {
		var ctxt = this;
		this.critters = [];
		this.kill_list = [];
		this.ticking = false;
		this.watch_id = false;
		this.stage = new createjs.Stage(this.stage_id);
		this.stage.on("stagemouseup", function(evt) {
			ctxt.addCritByType('microbe', {x: evt.stageX, y: evt.stageY});
		})
		this.buildPopulation();
	},
	
	buildPopulation: function() {
		for (var i = 0; i < this.capacity; i++) {
			var added = false;
			for (var percent in this.initial_population) {
				var type = this.initial_population[percent];
				if (i / this.capacity * 100 <= percent) {
					this.addCritByType(type);
					added = true;
					break;
				}
			}
			if (!added) {
				this.addCritByType('microbe');
			}
		}
	},
	
	reset: function() {
		for (var i = 0, l = this.critters.length; i < l; i++) {
			this.kill_list.push(i);
		}
		this.killEmAll();
		this.init();
	},
	
	start: function() {
		var ctxt = this;
		createjs.Ticker.addEventListener("tick", function() { ctxt.tick(); });
		createjs.Ticker.setInterval(25);
	},
	
	pause: function() {
		this.paused = !this.paused;
	},
	
	addCritByType: function(type, cfg) {
		cfg = cfg || {};
		cfg.environment = this;
		var crit = CritterFactory.produce(type, cfg);
		var shape = crit.getShape();
		
		this.critters.push(crit);
		this.stage.addChild(shape);
		return crit;
	},
	
	//addCrit: function(cfg) {
	//	var ctxt = this;
	//	cfg = cfg || {};
	//	cfg.environment = this;
	//	var crit = new Critter(cfg);
	//	this.critters.push(crit);
	//	this.stage.addChild(crit.getShape());
	//	return crit;
	//},
	
	killCrit: function(crit) {
		for (var i = 0, l = this.critters.length; i < l; i++) {
			if (this.critters[i].id == crit.id && !this.kill_list.indexOf(i) >= 0) {
				this.kill_list.push(i);
				break;
			}
		}
	},
	
	killEmAll: function() {
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
				if (!crit || typeof crit === 'undefined' || !crit.shape || typeof crit.shape === 'undefined') {
					//debugger;
				} else {
					this.stage.removeChild(crit.shape);
					this.critters.splice(this.kill_list[i], 1);
				}
			}
			this.kill_list = [];
		}
	},
	
	randomPosition: function() {
		var dims = this.dimensions();
		return {
			x: Math.round(Math.random() * dims.w),
			y: Math.round(Math.random() * dims.h)
		};
	},
	
	dimensions: function() {
		return {w: this.stage.canvas.width, h: this.stage.canvas.height};
	},

	findAll: function(type, filter) {
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
	},
	
	_xyz: null
});