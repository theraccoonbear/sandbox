
var CTypes = {
	'bug': {
		speed: 3,
		vitality: 100,
		matures_at: 100,
		diest_at: 500,
		type: 'bug',
		eats: ['microbe'],
		flight: true,
		height: 1,
		getShape: function(o) {
			var colors = ['#000000', '#111111', '#222222', '#333333'];
			
			var c = colors[Math.floor(Math.random() * colors.length)]
			
			this.shape = new createjs.Shape();
			this.shape.graphics.beginFill(c).drawEllipse(0, 0, 10, 5);
			this.shape.x = this.x;
			this.shape.y = this.y;
			return this.shape;
		}
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
		matures_at: 3,
		dies_at: 10,
		type: 'microbe',
		height: 0,
		flight: false,
		aquatic: true,
		vis_distance: 20,
		environment: null,
		eats: ['nutrient'], //['animal', 'plant', 'bug', 'microbe', 'nutrient'],
		x: 100,
		y: 100,
		getShape: function(o) {
			var colors = ['red', 'green', 'blue'];
			
			var c = colors[Math.floor(Math.random() * colors.length)]
			
			this.shape = new createjs.Shape();
			this.shape.graphics.beginFill(c).drawCircle(0, 0, 2);
			this.shape.x = ctxt.x;
			this.shape.y = ctxt.y;
			return this.shape;
		}
	};
	
	this.id = Math.random() * 100000000;
	
	for (var p in _defaults) {
		this[p] = opts[p] || _defaults[p];
	}
};


Critter.prototype.nearestFood = function() {
	var foods = this.environment.findAll(this.eats);
	if (foods.length == 0) {
		return false;
	}
	var near_dist = 10000000000;
	var near_idx = 0;
	for (var i = 0, l = foods.length; i < l; i++) {
		var dist = this.distanceTo(foods[i]);
		if (dist < near_dist) {
			near_dist = dist;
			near_idx = i;
		}
	}
	return foods[near_idx];
};

Critter.prototype.tick = function() {
	var ctxt = this;
	ctxt.age++;
	ctxt.hunger++;
	
	if (ctxt.hunger > 10) {
		food = ctxt.nearestFood();
		if (food) {
			var dist = this.distanceTo(food);
			if (dist < this.speed) {
				this.eat(food);
			} else {
				var vec = this.vectorTowards(food);
				ctxt.shape.x += vec.x;
				ctxt.shape.y += vec.y;
			}
		} else {
			this.idleMove();
		}
		
		if (ctxt.hunger > 100) {
			this.environment.killCrit(this);
		}
		
	} else {
		this.idleMove();
	}
};

Critter.prototype.idleMove = function() {
	this.shape.x += Math.round(Math.random() * 10) - 5;
	this.shape.y += Math.round(Math.random() * 10) - 5;	
};

Critter.prototype.vectorTowards = function(other) {
	var delta_x = this.shape.x - other.shape.x;
	var delta_y = this.shape.y - other.shape.y;
	
	var angle = Math.atan(delta_y/delta_x);
	var tick_x = Math.cos(angle) * this.speed;
	var tick_y = Math.sin(angle) * this.speed;
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
	this.hunger = 0;
	console.log('death!');
	this.environment.killCrit(other);
};