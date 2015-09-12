var game;

$(function() {
	
	game = new GameMap({
		mission: {
			start: {
				lat: 44.9778,
				lng: -93.2650
			},
			waypoints: [
				{ lat: 43.0667, lng: -89.4000}
			],
		},
		kph: 100
	});
});