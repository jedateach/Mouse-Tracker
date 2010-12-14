$(function() {
	
	var sequence = null;
	
	$('body').append("<img class=\"cursor\" src=\"cursor.gif\" style=\"position:fixed;\" />");	
	
	var cursor = $('img.cursor');
	
	function playSequence(){
		cursor.clearQueue();
		sequence = ($.mouseevents).slice();
		cursor.css({
			top: sequence[0].y,
			left: sequence[0].x
		});
		playStep(sequence);
	}
	
	var step = null;
	var prevstep = {time:0,top:0,left:0};
	
	//FIXME: Causes 'too much recursion' error, scroll animations not lining up with mousemovements
	function playStep(sequence){
		step = sequence.shift();
		//$('span.playstatus').text(step.time);
		
		if(step.type == 'mousemove'){
			cursor.animate({
				top: step.y,
				left:step.x
				},step.time-prevstep.time,
				'linear',
				function(){
					//$('body').append("<img src=\"dot.gif\" style=\"position:fixed;top:"+step.y+"px;left:"+step.x+"px;\" />"); //show trails
					nextStep(step,sequence);
				}
			);
		}else if(step.type == 'click'){
			cursor.css({background:"#ff0000"});
			nextStep(step,sequence);
		}else if(step.type == 'scroll'){
			cursor.animate({},0,'linear',function(){
				$('html,body').animate(
						{scrollTop: step.y,scrollLeft: step.x,},
						step.time-prevstep.time,
						'linear',
						function(){nextStep(step,sequence);}
				);
			});
		}else if(step.type == 'mousedown'){
			cursor.addClass('mousedown');
			cursor.delay(step.time-prevstep.time);
			nextStep(step,sequence);
		}else if(step.type == 'mouseup'){
			cursor.removeClass('mousedown');
			cursor.delay(step.time-prevstep.time);
			nextStep(step,sequence);
		}else{
			nextStep(step,sequence);
		}
	}
	
	function nextStep(current,sequence){
		prevstep = current;
		//$('#eventlog').append("log "+current.type+" "+current.x+" "+current.y);
		if(sequence.length > 0){
			playStep(sequence);
		}
	}
	//$('html,body').animate({scrollTop: 200}, 1000);
	$('button.play').click(function(){playSequence()});
});