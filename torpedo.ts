var trpd: Torpedo;

enum EMessageType {
	Ready,
	Unready,
	Seek,
}

class Message {
	constructor (public type: EMessageType, public active_time: number, public seek_pos: number) 
	{
		
	}
}

class Torpedo {
	vid: HTMLVideoElement;
	local_ready: boolean;
	
	// Mock server bits
	server_ready: boolean;
	
	constructor (vid_id: string) {
		this.vid = <HTMLVideoElement> document.getElementById (vid_id);
		let that = this;
		this.vid.addEventListener ("seeked", function () { that.vid_seeked (); }, true);
		this.vid.addEventListener ("play", function () { that.vid_played (); }, true);
		this.vid.addEventListener ("pause", function () { that.vid_paused (); }, true);
	}
	
	// Circuit breaker
	log (msg: string): void {
		if (true) {
			console.log (msg);
		}
	}
	
	vid_paused (): void {
		this.log ("Paused");
	}
	
	vid_played (): void {
		this.log ("Played");
	}
	
	// Sought?
	vid_seeked (): void {
		this.log ("Seeked");
		this.vid.pause ();
	}
	
	ready (): void {
		this.local_ready = true;
		this.send_to_server (new Message (EMessageType.Ready, 0.0));
	}
	
	unready (): void {
		this.local_ready = false;
		this.send_to_server (new Message (EMessageType.Unready, 0.0));
	}
}

function torpedo_load (vid_id: string) {
	trpd = new Torpedo (vid_id);
}
