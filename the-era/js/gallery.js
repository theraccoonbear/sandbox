$(function() {
	$('[id]').each(function(i, e) {
		var $e = $(e);
		var id = $e.attr('id');
		window['$' + id] = $e;
	});
	
	$('a.gallery-thumb').click(function(e) {
		var $a = $(this);
		$largeImage.attr('src', $a.attr('href'));
		e.preventDefault();
	});
	
});