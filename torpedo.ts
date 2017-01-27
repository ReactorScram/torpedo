declare var vid1: HTMLVideoElement;
declare var vid2: HTMLVideoElement;

function vid_paused (vid) {
	console.log ("Paused");
	vid1.pause ();
	vid2.pause ();
}

function vid_played (vid) {
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

function load_torpedo (vid_id1: string, vid_id2: string) {
	vid1 = acquire_video (vid_id1);
	vid2 = acquire_video (vid_id2);
}
