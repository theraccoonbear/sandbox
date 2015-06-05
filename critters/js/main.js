//$(function() {	
//	$('[id]').each(function(i, e) {
//		var $e = $(e);
//		var id = $e.attr('id');
//		window['$' + id] = $e;
//	});	
//});


//var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
//var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
//var stage = document.getElementById('stage');
//stage.width = w;
//stage.height = h;

CritterFactory.environment = new EnvironmentClass({
	stage_id: 'stage',
	capacity: 300,
	initial_population: {
		20: 'bug'
	}
});

CritterFactory.environment.init();
CritterFactory.environment.start();

//for (var i = 0; i < env.capacity; i++) {
//	var cfg = {};
//	if (Math.random() > 0.90) { cfg = CTypes.bug(); }
//	env.addCrit(cfg);
//}




