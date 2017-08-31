/*
 * Licensed under the terms of the GNU GPL
 */
jQuery(document).ready(function($){
	
	var $window = $(window),
        $menu = $('div.menu');
	
	function checkWindowSize() {
		var width = $window.width();
		if ( width < 824 ) {
			return $menu.addClass('nav-mobile');
		}
		$menu.removeClass('nav-mobile');
	}
	
	$window
        .resize(checkWindowSize)
        .trigger('checkWindowSize');
		
	checkWindowSize();
	
	/* prepend menu icon */
	$('div.menu').prepend('<div id="menu-icon">Menu</div>');
	
	
	/* toggle nav */
	$("#menu-icon").on("click", function(){
		$("div.menu > ul").slideToggle();
		$(this).toggleClass("active");
	});
	
	/* toggle search box */
	$("#search-icon").on("click", function(){
		$("#search-box-wrap").slideToggle();
	});
	
	$("#close-x").on("click", function(){
		$("#search-box-wrap").slideUp();
	});
	
	
	/* jquery cycle */
	var $slider = $('.cycle-slideshow');
	$slider.imagesLoaded( function() {
		$slider.slideDown(1000);
	});
	
	/* masonry */
	
	var $container = $('#grid-wrap');
	
	$container.masonry({
	  itemSelector : '.grid-box',
	});
	
	$container.imagesLoaded( function() {
	  $container.masonry({
		  itemSelector : '.grid-box',
	  });
	});
	
	$(window).resize(function() {
		$container.masonry({
		  itemSelector : '.grid-box',
		});
	});


	// By Chris Coyier & tweaked by Mathias Bynens

	// Find all YouTube videos
	var $allVideos = $('iframe[src^="http://player.vimeo.com"], iframe[src^="https://player.vimeo.com"], iframe[src^="//player.vimeo.com"], iframe[src^="http://www.youtube.com"],  iframe[src^="https://www.youtube.com"], iframe[src^="//www.youtube.com"], iframe[src^="http://www.dailymotion.com"], iframe[src^="//www.dailymotion.com"]'),

	    // The element that is fluid width
	    $fluidEl = $(".post-content");

	// Figure out and save aspect ratio for each video
	$allVideos.each(function() {

		$(this)
			.data('aspectRatio', this.height / this.width)
			
			// and remove the hard coded width/height
			.removeAttr('height')
			.removeAttr('width');

	});

	// When the window is resized
	// (You'll probably want to debounce this)
	$(window).resize(function() {

		var newWidth = $fluidEl.width();
		
		// Resize all videos according to their own aspect ratio
		$allVideos.each(function() {

			var $el = $(this);
			$el
				.width(newWidth)
				.height(newWidth * $el.data('aspectRatio'));

		});

	// Kick off one resize to fix all videos on page load
	}).resize();
	
	// Fix for Safari
	
	var fixSafariMargin = function() {
		// check if the browser is Safari
		if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {                  
			$('footer[role=contentinfo]').css('display', 'block');
			$('#site-generator').css('display', 'block');
			$('#site-generator').css('padding-top', '15px');
		}
	}
	
	fixSafariMargin();
	
	$(window).resize(function() {
		fixSafariMargin();
	});

});