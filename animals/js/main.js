//$(function() {	
//	$('[id]').each(function(i, e) {
//		var $e = $(e);
//		var id = $e.attr('id');
//		window['$' + id] = $e;
//	});	
//});


var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
var stage = document.getElementById('stage');
stage.width = w;
stage.height = h;

var env = new Environment({stage_id: 'stage'});
env.init();



for (var i = 0; i < 200; i++) {
	var pos = env.randomPosition();
	var cfg = {};
	if (Math.random() > 0.5) {
		cfg = CTypes.bug;
	}

	cfg.x = pos.x;
	cfg.y = pos.y;
	env.addCrit(new Critter(cfg));
}

//env.addCrit(new Critter());
