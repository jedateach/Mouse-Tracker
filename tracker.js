$(function() {
	
	var maxscroll = 0;
	var starttime = new Date();
	
	var events = new Array();
	$.mouseevents = events;
	
	$(window).mousemove(function(e){
	      var pageCoords = e.pageX + ", " + e.pageY;
	      var clientCoords = e.clientX + ", " + e.clientY;
	      $("span.pagepos").text(pageCoords);
	      $("span:.clientpos").text(clientCoords);
	     
	      recordEvent(e);
	});
	
	$(window).scroll(function(e){
		$('span.scroll').text($(this).scrollTop());
	});
	
	$('span.windowsize').text($(window).width() + ", " + $(window).height());
	
	//TODO: possibly introduce a recording interval to free up cpu usage
	
	//bind events
	$(window).mousedown(function(e){recordEvent(e);});
	$(window).mouseup(function(e){recordEvent(e);});
	$(window).scroll(function(e){
		events.push({
			time: e.timeStamp - starttime,
			type:e.type,
			which:e.which,
			x:$(window).scrollLeft(),
			y:$(window).scrollTop()
		});
	});
	$(window).keypress(function(e){recordEvent(e);});
	$(window).resize(function(e){recordEvent(e);});
	
	recordEvent = function recordEvent(e){
		events.push({
				time: e.timeStamp - starttime,
				type:e.type,
				which:e.which,
				x:e.clientX,
				y:e.clientY
			}); 
	};

	/**
	 * Reset all values.
	 */
	function reset(){
		events = new Array();
	}
	
	//TODO: only submit if longer than x seconds
	//TODO: submit partial recording if over x seconds
	function submitRecording(){
		
		var recording = {
				location: document.location,
				//events: events
		};
		
		var out = '';
		for (key in events){
			out += key+" - "+events[key].type+" "+events[key].which+"<br/>";
		}
		$('p').html(out);
		reset();
	}
	
	$(window).bind("beforeunload", function(){
		//TODO: submitRecording();
	});

	
	$('button.output').click(function(){submitRecording()});
	
});