
var CTypes = {
	'bug': function() {
		var bdef = {
			speed: 3,
			vitality: 100,
			matures_at: 500,
			spawn_rate: 500,
			diest_at: 5000,
			type: 'bug',
			eats: ['microbe'],
			flight: true,
			height: 1,
			asexual: false,
			vis_distance: 250,
			getShape: function(o) {
				var colors = ['#000000', '#222222', '#444444', '#666666'];
				
				var c = colors[Math.floor(Math.random() * colors.length)]
				
				this.shape = new createjs.Shape();
				this.shape.name = this.id;
				this.shape.graphics.beginFill(c).drawEllipse(0, 0, 10, 5);
				this.shape.x = this.x;
				this.shape.y = this.y;
				return this.shape;
			}
		};
		return bdef;
	},
};

var Critter = function(opts) {
	opts = opts || {};
	var ctxt = this;
	var _defaults = {
		speed: 1,
		age: 0,
		vitality: 10,
		hunger: 0,
		hunger_threshold: 500,
		matures_at: 100,
		spawn_rate: 100,
		dies_at: 1000,
		type: 'microbe',
		last_spawn: 0,
		height: 0,
		flight: false,
		aquatic: true,
		vis_distance: 100,
		asexual: false,
		environment: null,
		eats: ['nutrient'], //['animal', 'plant', 'bug', 'microbe', 'nutrient'],
		waypoint: {
			x: 0,
			y: 0
		},
		getShape: function(o) {
			var colors = ['red', 'green', 'blue'];
			
			var c = colors[Math.floor(Math.random() * colors.length)]
			
			this.shape = new createjs.Shape();
			this.shape.name = this.id;
			this.shape.graphics.beginFill(c).drawCircle(0, 0, 2);
			this.shape.x = ctxt.x;
			this.shape.y = ctxt.y;
			return this.shape;
		}
	};
	
	this.id = Math.random() * Date.now();
	
	for (var p in _defaults) {
		this[p] = opts[p] || _defaults[p];
	}
	
	var pos = this.environment.randomPosition();
	this.x = opts.x || pos.x;
	this.y = opts.y || pos.y;
	
	this.dies_at *= 1 + ((Math.random() * 0.2) - 0.1);
	this.speed = this.speed * (1 + (Math.random() * 0.1));
};

Critter.heritable = ['speed', 'height', 'vis_distance', 'vitality', 'hunger_threshold'];

Critter.prototype.nearestFood = function() {
	return this.nearestX(this.eats);
};



Critter.prototype.nearestX = function(x) {
	var targets = this.environment.findAll(x);
	if (targets.length == 0) {
		return false;
	}
	var near_dist = 10000000000;
	var near_idx = 0;
	for (var i = 0, l = targets.length; i < l; i++) {
		var dist = this.distanceTo(targets[i]);
		if (dist < near_dist && dist < this.vis_distance) {
			near_dist = dist;
			near_idx = i;
		}
	}
	return targets[near_idx];
};

Critter.prototype.tick = function() {
	var ctxt = this;
	ctxt.age++;
	ctxt.hunger++;
	
	this.waypoint = this.vectorTowards(this.environment.randomPosition());
	
	if (this.age > this.matures_at && this.type == 'bug') {
		debugger;
	}
	
	if (ctxt.hunger > 100) {
		if (this.eats[0] == 'nutrient') { // poop as nutrients?
			this.hunger = 0;
		} else {
			var food = ctxt.nearestFood();
			if (food) {
				var dist = this.distanceTo(food);
				if (dist < this.speed) {
					this.eat(food);
				} else {
					this.waypoint = this.vectorTowards(food);
				}
			}
		}
	} else if (this.age > this.matures_at && this.age - this.last_spawn > this.spawn_rate) {
		var mate = this.asexual ? this : ctxt.nearestMate();
		if (mate) {
			var dist = this.distanceTo(mate);
			if (dist < this.speed) {
				this.mateWith(mate);
			} else {
				this.waypoint = this.vectorTowards(mate);
			}
		}
	} else {
		
	}

	
	this.shape.x += this.waypoint.x;
	this.shape.y += this.waypoint.y;
	
	var dims = this.environment.dimensions();
	if (this.shape.x > dims.w) {
		this.shape.x = 1;
	} else if (this.shape.x < 1) {
		this.shape.x = dims.w;
	}
	
	if (this.shape.y > dims.h) {
		this.shape.y = 1;
	} else if (this.shape.y < 1) {
		this.shape.y = dims.h;
	}
	
	
	
	
	if (ctxt.hunger > ctxt.hunger_threshold) {
		this.vitality--;
		if (this.vitality < 1) {
			console.log(this.type + " died of hunger");
			this.environment.killCrit(this);
		}
		
	} else if (ctxt.age > ctxt.dies_at) {
		//console.log(this.type + " died of old age");
		//this.environment.killCrit(this);
	}
};


Critter.prototype.nearestMate = function() {
	return this.nearestX(this.type);
};

Critter.prototype.receptive = function() {
	return (this.age >= this.matures_at && this.age - this.last_spawn >= this.spawn_rate);
};

Critter.prototype.mateWith = function(mate) {
	var cfg = this.type == 'bug' ? CTypes.bug() : {};
	for (var i = 0, l = Critter.heritable.length; i < l; i++) {
		var trait = Critter.heritable[i];
		cfg[trait] = ((mate[trait] + this[trait]) / 2) * (((Math.random() * 0.1) - 0.05) + 1); // averaged + genetic drift
	}
	cfg.x = (mate.shape.x + this.shape.x) / 2;
	cfg.y = (mate.shape.y + this.shape.y) / 2;
	this.last_spawn = this.age;
	mate.last_spawn = mate.age;
	console.log(this.type + ' reproduced', cfg);
	this.environment.addCrit(cfg);
};

Critter.prototype.emitSpawn = function() {
	var cfg = jQuery.extend(true, {}, this);
	delete cfg.age;
	delete cfg.hunger;
	delete cfg.id;
	delete cfg.last_spawn;
	cfg.x += (Math.random() * 30) - 15;
	cfg.y += (Math.random() * 30) - 15;
	this.environment.addCrit(cfg);
	this.last_spawn = this.age;
	console.log('spawned', cfg);
};

Critter.prototype.idleMove = function() {
	this.shape.x += Math.round(Math.random() * 10) - 5;
	this.shape.y += Math.round(Math.random() * 10) - 5;	
};

Critter.prototype.vectorTowards = function(other) {
	var delta_x = other.shape ? this.shape.x - other.shape.x : this.shape.x - other.x;
	var delta_y = other.shape ? this.shape.y - other.shape.y : this.shape.y - other.y;
	
	var angle = Math.atan(delta_y/delta_x);
	var tick_x = Math.cos(angle) * this.speed;
	var tick_y = Math.sin(angle) * this.speed;
	
	if (delta_x > 0) { tick_x = -tick_x; }
	if (delta_y > 0) { tick_y = -tick_y; }
	
	return {
		x: tick_x,
		y: tick_y
	};
};

Critter.prototype.distanceTo = function(other) {
	var delta_x = this.shape.x - other.shape.x;
	var delta_y = this.shape.y - other.shape.y;
	return Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
};

Critter.prototype.eat = function(other) {
	this.hunger -= other.vitality * 3;
	this.environment.killCrit(other);
};