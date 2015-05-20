
var CTypes = {
	'bug': {
		speed: 3,
		vitality: 100,
		matures_at: 100,
		diest_at: 500,
		type: 'bug',
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
	
	for (var p in _defaults) {
		this[p] = opts[p] || _defaults[p];
	}
};


Critter.prototype.nearestFood = function() {
	
};

Critter.prototype.tick = function() {
	var ctxt = this;
	ctxt.age++;
	ctxt.hunger++;
	
	if (ctxt.hunger > 10) {
		food = ctxt.nearestFood();
	}
	
	ctxt.shape.x += Math.round(Math.random() * 10) - 5;
	ctxt.shape.y += Math.round(Math.random() * 10) - 5;
};



Critter.prototype.distanceTo = function(other) {
	var delta_x = this.shape.x - other.shape.x;
	var delta_y = this.shape.y - other.shape.y;
	return Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
};

