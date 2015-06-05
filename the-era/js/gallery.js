$(function() {
	$('[id]').each(function(i, e) {
		var $e = $(e);
		var id = $e.attr('id');
		window['$' + id] = $e;
	});
	
	window.$window = $(window);
	
	var preloader = function(cb) {
		this.loaded = {};
		this.images = {};
		this.after_load = typeof cb === 'function' ? cb : function() { /* ... */ };
	};
	
	preloader.prototype.add = function(img) {
		var ctxt = this;
		if (this.loaded[img]) {
			this.after_load(cb);
		} else {
			this.images[img] = $('<img>');
			this.images[img].one("load", function() {
				ctxt.loaded[img] = true;
				ctxt.after_load(img);
			}).each(function() {
				if(this.complete) $(this).load();
			});
		}
	};
	
	var pl = new preloader(/*function(img) {
		console.log('we loaded ' + img);
	}*/);
	
	$('ul.thumbs a').each(function(i, e) {
		var $e = $(e);
		pl.add($e.attr('href'));
	});
	
	var dims = function() {
		return {
			w: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
			h: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
		};
	};
	
	var resizer = function() {
		var d = dims();
		
		var frame_values = {
			left: 0,
			top: 0,
			width: d.w,
			height: d.h - $thumbContainer.outerHeight() - 25
		};
		
		var iw = $largeImage.data('width');
		var ih = $largeImage.data('height');
		
		if ($largeImage.hasClass('rotate-90') || $largeImage.hasClass('rotate-270')) {
			var tw = iw;
			iw = ih;
			ih = tw;
		}
		
		var img_values = {
			height: frame_values.height,
			width: (frame_values.height / ih) * iw
		};
		
		$largeImageFrame.css(frame_values);
		//$largeImage.css(img_values);
		$largeImage.attr('width', img_values.width).attr('height', img_values.height);
		
		//$largeImageFrame.css({
		//	bottom: $(window).height() - $('.thumb-container').position().top
		//});
		
		//var fw = $largeImageFrame.outerWidth();
		//var fh = $largeImageFrame.outerHeight();
		//
		//var iw = $largeImage.data('width');
		//var ih = $largeImage.data('height');
		//
		//if (typeof iw !== 'undefined' && typeof ih !== 'undefined') {
		//	var far = fw / fh;
		//	var iar = iw / ih;
		//	
		//	console.log('frame', fw, fh, far);
		//	console.log('image', iw, ih, iar);
		//	
		//	var nh = iar > 1 ? fh : iw;
		//	
		//	
		//}
	};
	
	$(window).resize(resizer);
	resizer();
	
	$('a.gallery-thumb').click(function(e) {
		var $a = $(this);
		var $img = $a.find('img');
		var rot = $img.data('rotate');
		var w = $img.data('width');
		var h = $img.data('height');
		
		
		$largeImage
			.removeClass('rotate-0')
			.removeClass('rotate-90')
			.removeClass('rotate-180')
			.removeClass('rotate-270')
			.addClass('rotate-' + rot)
			.data('width', w)
			.data('height', h)
			.attr('src', $a.attr('href'));
		
		resizer();
		
		e.preventDefault();
	});
	
});