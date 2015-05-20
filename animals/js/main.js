$(function() {	
	$('[id]').each(function(i, e) {
		var $e = $(e);
		var id = $e.attr('id');
		window['$' + id] = $e;
	});	
});

var env = new Environment({stage_id: 'stage'});
env.init();

for (var i = 0; i < 10; i++) {
	var pos = env.randomPosition();
	console.log(pos);
	env.addCrit(new Critter(pos));
}

//env.addCrit(new Critter());
