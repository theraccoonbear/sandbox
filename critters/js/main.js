

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
var stage = document.getElementById('stage');
stage.width = w;
stage.height = h;

CritterFactory.environment = new EnvironmentClass({
	stage_id: 'stage',
	capacity: 300,
	initial_population: {
		15: 'bug'
	}
});

CritterFactory.environment.init();
CritterFactory.environment.start();


$(function() {	
	$('[id]').each(function(i, e) {
		var $e = $(e);
		var id = $e.attr('id');
		window['$' + id] = $e;
	});
	
	$btnPause.on('click', function(e) {
		CritterFactory.environment.pause();
		$btnPause.val(CritterFactory.environment.paused ? 'Resume' : 'Pause');
	});
	
	$btnReset.on('click', function(e) {
		CritterFactory.environment.reset();
	});
	
});
