$(function() {
	$('[id]').each(function(i, e) {
		var $e = $(e);
		var id = $e.attr('id');
		window['$' + id] = $e;
	});
	
	var resizer = function() {
		$largeImageFrame.css({
			bottom: $(window).height() - $('.thumb-container').position().top
		});
	};
	
	$(window).resize(resizer);
	resizer();
	
	$('a.gallery-thumb').click(function(e) {
		var $a = $(this);
		var $img = $a.find('img');
		var rot = $img.data('rotate');
		var w = $img.data('width');
		var h = $img.data('width');
		$largeImage
			.removeClass('rotate-0')
			.removeClass('rotate-90')
			.removeClass('rotate-180')
			.removeClass('rotate-270')
			.addClass('rotate-' + rot)
			.attr('src', $a.attr('href'));
		e.preventDefault();
	});
	
});