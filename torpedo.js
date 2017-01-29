// for browsers that don't have console
if(typeof window.console == 'undefined') { window.console = {log: function (msg) {} }; }

// Start checking for any events that occurred after page load time (right now)
// Notice how we use .getTime() to have num milliseconds since epoch in UTC
// This is the time format the longpoll server uses.
var sinceTime = (new Date(Date.now())).getTime();

// Let's subscribe to video related events.
var category = "torpedo";

let server = "api";

let vid = document.getElementById ("trpd_vid");
let debug_text = document.getElementById ("debug-text");

vid.addEventListener ("waiting", function () {ready (false);}, true);

let client_id = -1;

let other_readies = {};

function write_debug (msg) {
	debug_text.innerHTML = msg;
}

function ready (r) {
	let url = server + "/ready";
	let msg = {
		ready: r,
		time: vid.currentTime,
		wall_time: Date.now (),
		client_id: client_id,
		clients_seen: get_pausers () // TODO: Yes, I know :(
	};
	let msg_json = JSON.stringify (msg);
	$.ajax ({ method: "POST", url: url, data: msg_json });
	
	if (! r) {
		vid.pause ();
	}
}

function get_id () {
	let url = server + "/get_id";
	$.ajax ({ method: "GET", url: url, success: function (data) {
		client_id = parseInt (data);
		console.log ("Got ID: " + client_id);
		ready (false);
	}});
}

function pluralize (noun, count) {
	if (count === 1) {
		return noun;
	}
	else {
		return noun + "s";
	}
}

function receive_other_ready (msg) {
	other_readies [msg.client_id] = msg;
	let pausers = get_pausers ();
	
	let our_ready = other_readies [client_id];
	
	if (pausers == 0) {
		write_debug ("All ready");
	}
	else if (!!our_ready && !our_ready.ready) {
		if (pausers == 1) {
			write_debug ("You paused");
		}
		else {
			write_debug ("You + " + (pausers - 1) + " " + pluralize ("other", pausers - 1) + " paused");
		}
	}
	else {
		write_debug (pausers + " " + pluralize ("other", pausers) + " paused");
	}
	
	// If a player joins late and missed our 'unready',
	// resend one
	if (msg.clients_seen < get_pausers ()) {
		ready (other_readies [client_id].ready);
	}
	
	play_if_ready (pausers);
}

function for_each_ready (fn) {
	for (var key in other_readies) {
		var obj = other_readies[key];
		
		fn (obj);
	}
}

// I have a feeling this function is redundant and it won't sync right
function get_slowest_time () {
	let t = 0.0;
	
	for_each_ready (function (msg) {
		if (! msg.ready) {
			if (t == 0.0) {
				t = msg.time;
			}
			else if (msg.time < t) {
				t = msg.time;
			}
		}
	});
	
	return t;
}

function get_pausers () {
	let pausers = 0;
	
	for_each_ready (function (msg) {
		if (
			msg.ready === false &&
			msg.client_id >= 0 &&
			msg.wall_time + 30 * 1000 >= Date.now ()
		) {
			pausers += 1;
		}
	});
	return pausers;
}

function play_if_ready (pausers) {
	if (pausers == 0) {
		vid.play ();
	}
	else {
		vid.pause ();
		let slowest_time = get_slowest_time ();
		if (slowest_time != 0.0) {
			vid.currentTime = slowest_time;
		}
	}
}

(
function main () {
function poll() {
	var timeout = 45;  // in seconds
	var optionalSince = "";
	if (sinceTime) {
		optionalSince = "&since_time=" + sinceTime;
	}
	var pollUrl = server + "/events?timeout=" + timeout + "&category=" + category + optionalSince;
	// how long to wait before starting next longpoll request in each case:
	var successDelay = 10;  // 10 ms
	var errorDelay = 3000;  // 3 sec
	$.ajax({ url: pollUrl,
		success: function(data) {
			if (data && data.events && data.events.length > 0) {
				// got events, process them
				// NOTE: these events are in chronological order (oldest first)
				for (var i = 0; i < data.events.length; i++) {
					// Display event
					var event = data.events[i];
					//$("#video-events").append("<li>" + event.data + " at " + (new Date(event.timestamp).toLocaleTimeString()) +  "</li>")
					
					var vid_id = "trpd_vid";
					var vid = document.getElementById (vid_id);
					
					var msg = JSON.parse (atob (event.data));
					
					receive_other_ready (msg);
					
					// Update sinceTime to only request events that occurred after this one.
					sinceTime = event.timestamp;
				}
				// success!  start next longpoll
				setTimeout(poll, successDelay);
				return;
			}
			if (data && data.timeout) {
				console.log("No events, checking again.");
				// no events within timeout window, start another longpoll:
				setTimeout(poll, successDelay);
				return;
			}
			if (data && data.error) {
				console.log("Error response: " + data.error);
				console.log("Trying again shortly...")
				setTimeout(poll, errorDelay);
				return;
			}
			// We should have gotten one of the above 3 cases:
			// either nonempty event data, a timeout, or an error.
			console.log("Didn't get expected event data, try again shortly...");
			setTimeout(poll, errorDelay);
		}, dataType: "json",
	error: function (data) {
		console.log("Error in ajax request--trying again shortly...");
		setTimeout(poll, errorDelay);  // 3s
	}
	});
}

get_id ();
poll ();
})();