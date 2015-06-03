$(function() {
	$('[id]').each(function(i, e) {
		var $e = $(e);
		var id = $e.attr('id');
		window['$' + id] = $e;
	});
	
	$('a.gallery-thumb').click(function(e) {
		var $a = $(this);
		var rot = $a.find('img').data('rotate');
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