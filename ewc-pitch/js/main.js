$(function() {

	var sites = [
		'img/california-almonds.jpg',
		'img/pig-nw.jpg',
		'img/grass-nw.jpg',
		'img/adventure-rabbi.jpg',
		'img/brain-feed.jpg'
	];
	
	function setupMagnific() {
		$('.full-gallery').magnificPopup({ 
			delegate: '.slide-frame',
			type: 'inline',
			gallery:{
				enabled:true
			},
			callbacks: {
				elementParse: function(item) {
					// Function will fire for each target element
					// "item.el" is a target DOM element (if present)
					// "item.src" is a source that you may modify
					console.log(item);
					if ($(item.el).hasClass('mfp-inline')) {
						 item.type = 'inline';
					} else {
						 item.type = 'image';
					}
		
				}
			}
		});
	}
	
	var s_idx = 0;
	var $sites = $('a.site-link');
	$sites.each(function(i, e) {
		var $a = $(this);
		var $img = $a.find('img');
		var img = sites[i % sites.length];
		
		$a.attr('href', img);
		$img.attr('src', img);
		
		if (i >= $sites.length - 1) {
			setupMagnific();
		}
	});
	
	
	
});
