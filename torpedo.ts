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
	send_lag: number;
	recv_lag: number;
	
	constructor (vid_id: string) {
		this.vid = <HTMLVideoElement> document.getElementById (vid_id);
		let that = this;
		this.vid.addEventListener ("seeked", function () { that.vid_seeked (); }, true);
		this.vid.addEventListener ("play", function () { that.vid_played (); }, true);
		this.vid.addEventListener ("pause", function () { that.vid_paused (); }, true);
		
		this.send_lag = 300;
		this.recv_lag = 200;
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
	
	// This obviously shouldn't touch the DOM
	server_process_msg (msg: Message): void {
		this.server_ready = msg.type === EMessageType.Ready;
		this.send_to_local (new Message (msg.type, 0.0));
	}
	
	// This obviously shouldn't touch the server things
	local_process_msg (msg: Message): void {
		if (msg.type === EMessageType.Ready) {
			this.vid.play ();
		}
		else {
			this.vid.pause ();
		}
	}
	
	send_to_server (msg: Message): void {
		let that = this;
		setTimeout(function() { that.server_process_msg (msg) }, this.send_lag);
	}
	
	send_to_local (msg: Message): void {
		let that = this;
		setTimeout(function() { that.local_process_msg (msg) }, this.recv_lag);
	}
}

function torpedo_load (vid_id: string) {
	trpd = new Torpedo (vid_id);
}
