//found at http://blog.fl3x.de/2007/10/18/record-mouse-movement-using-javascript-and-ajax/

/*
if (!window.console || !console.firebug) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i) {
        window.console[names[i]] = function() {};
    }
}
*/


Event.Replayable = Class.create();
Event.Replayable.prototype = {
  initialize: function(type, target, mouseX, mouseY, time, id, href) {
    this.type    = type;
    this.target  = target;
    this.mouseX  = mouseX;
    this.mouseY  = mouseY;
    this.time    = time;
	this.id      = id   ? id   : '';
	this.href    = href ? href : '';
  }
}


Event.DelayedMoveObserver = Class.create();
Event.DelayedMoveObserver.prototype = {
  initialize: function(element, delay, callback) {
    this.delay     = delay || 0.5;
    this.element   = $(element);
    this.callback  = callback;
    this.timer     = null;
    this.event     = null;
    this.mouseX    = -1;
    this.mouseY    = -1;
    this.Mousemove_Listener = this.delayedListener.bindAsEventListener(this);
    Event.observe(this.element,'mousemove', this.Mousemove_Listener);
  },
  Mousemove_Listener: null,
  delayedListener: function(event) {
    if(this.timer) clearTimeout(this.timer);
    // this.event  = event;
    this.mouseX = Event.pointerX(event);
    this.mouseY = Event.pointerY(event);
    this.target = event.target;
    this.timer  = setTimeout(this.onTimerEvent.bind(this), this.delay * 1000);
  },
  onTimerEvent: function(e) {
    this.timer = null;
    this.callback(new Event.Replayable('mousemove', this.target, this.mouseX, this.mouseY, new Date().getTime()) );
  },
  stopObserving: function() {
      Event.stopObserving(this.element,'mousemove', this.Mousemove_Listener);
  }
};


Event.Replay = Class.create();
Event.Replay.prototype = {
  initialize: function() {
    this.events    = new Array();
    this.starttime = new Date().getTime();
    this.mouseObserver = null;
    this.clickObserver = null;
    this.isObserving   = false;
  },

  reset: function() {
    this.events    = new Array();
    this.starttime = new Date().getTime();
  },

  addEvent: function(event) {
      event.time = event.time - this.starttime;
      this.events[this.events.length] = event;


	  if (event.target && event.target.id) {
	      event.id = event.target.id;
	  }
	  
	  if (event.type == 'click' && event.target && event.target.tagName == 'A') {
	     event.href = event.target.href;
	  }
      event.target = (event.target && event.target.tagName) ? event.target.tagName : (event.srcElement ? event.srcElement.tagName : '?') ;      

      if (event.type == 'mousemove') {
        // new Effect.Move($('crosshair'), {duration: 0.4, x:event.mouseX, y:event.mouseY, mode: 'absolute'} );
      }

      // hack
      if (event.type == 'click' && event.target == 'A' ) {
          this.sendEvents();
      }
      return true;
  },

  replayEvents: function() {
      Element.show('crosshair');
      for (i = 0; i <this.events.length; i++) {
          this.replayEvent(this.events[i]);
      }
  },

  replayEvent: function(e) {
      // if (this.timer) {clearTimeout(this.timer); }
      // console.log(e.time + " " + e.type );
      if (e.type == 'click') {
          this.timer = setTimeout(this.replayClickEvent.bind(e), e.time);
      } else if (e.type = 'mousemove') {
          this.timer = setTimeout(this.replayMousemoveEvent.bind(e), e.time);
      }
  },
  replayMousemoveEvent: function () {
      // printfire('replayMousemoveEvent');
      new Effect.Move($('crosshair'), {duration: 0.3, x:this.mouseX, y:this.mouseY, mode: 'absolute'} );
	  //console.log("MOVE");
      //scrollToif ()
  },
  replayClickEvent: function () {
      // console.log("CLICK" + this.id);
      if (this.href) {
          document.location = this.href;
          return;
      }
      if (this.id && $(this.id)) {

      if (document.all) { 
        $(this.id).fireEvent("onclick"); 
      } else { 
          var evt = document.createEvent("MouseEvents");
          evt.initMouseEvent("click", true, true, window,
                              0, 0, 0, 0, 0, false, false,
                              false, false, 0, null);
           var el = $(this.id);
           var canceled = !el.dispatchEvent(evt);
           // console.log("click cancled`:", canceled);
        }
      }

  },
  observe: function() {
    // observe mousemove
    this.reset();
    this.mouseObserver = new Event.DelayedMoveObserver (document,  0.04, this.observeMousemove.bind(this) );
    // observe click
    this.Click_Listener = this.observeClick.bindAsEventListener(this);
    Event.observe(document, "click", this.Click_Listener, false);
    this.isObserving = true;
  },
  observeMousemove: function(event) {
    // printfire("BrowserEvent: MOUSEMOVE");
    this.addEvent(event);
  },
  Click_Listener: null,
  observeClick: function(event) {
    // printfire("BrowserEvent: CLICK");
    this.addEvent ( new Event.Replayable('click', event.target ? event.target : (event.srcElement ? event.srcElement : null) , Event.pointerX(event), Event.pointerY(event), new Date().getTime()) );
    return true;
  },
  stopObserving: function() {
      this.mouseObserver.stopObserving();
      // Event.stopObserving(document, "click", this.Click_Listener);
      this.isObserving = false;
  },
  sendEvents: function() {
    recording = {
        location: document.location,
        events: this.events
    };
    json = JSON.stringify(recording);
    url = 'record.php';
    ajax = new Ajax.Request(url, {method: 'post', postBody: json, asynchronous: false});
  }
}
