declare var vid1: HTMLVideoElement;
declare var vid2: HTMLVideoElement;

declare var player1_ready: boolean;
declare var player2_ready: boolean;

function vid_paused (vid) {
	pause_all ();
}

function vid_played (vid) {
	play_all ();
}

function pause_all () {
	console.log ("Paused");
	vid1.pause ();
	vid2.pause ();
}

function play_all () {
	console.log ("Played");
	vid1.play ();
	vid2.play ();
}

function abs_diff (time1: number, time2: number): number {
	return Math.abs (time1 - time2);
}

function vid_seeked (vid) {
	console.log ("Seeked");
	
	// Try to get within a quarter second, anyway
	var epsilon: number = 0.25;
	
	if (abs_diff (vid1.currentTime, vid.currentTime) > epsilon) {
		vid1.currentTime = vid.currentTime;
	}
	
	if (abs_diff (vid2.currentTime, vid.currentTime) > epsilon) {
		vid2.currentTime = vid.currentTime;
	}
}

function acquire_video (vid_id: string): HTMLVideoElement {
	var vid: HTMLVideoElement = <HTMLVideoElement> document.getElementById (vid_id);
	vid.addEventListener ("seeked", function () { vid_seeked (vid); }, true);
	vid.addEventListener ("play", function () { vid_played (vid); }, true);
	vid.addEventListener ("pause", function () { vid_paused (vid); }, true);
	return vid;
}

function play1 () {
	player1_ready = true;
	update_play_pause ();
}

function play2 () {
	player2_ready = true;
	update_play_pause ();
}

function pause1 () {
	player1_ready = false;
	update_play_pause ();
}

function pause2 () {
	player2_ready = false;
	update_play_pause ();
}

function all_players_ready () {
	return player1_ready && player2_ready;
}

function update_play_pause () {
	if (all_players_ready ()) {
		play_all ();
	}
	else {
		pause_all ();
	}
}

function load_torpedo (vid_id1: string, vid_id2: string) {
	vid1 = acquire_video (vid_id1);
	vid2 = acquire_video (vid_id2);
	
	player1_ready = false;
	player2_ready = false;
}
