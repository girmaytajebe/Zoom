const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
	path: "/peerjs",
	host: "/",
	port: "3000",
});
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};

navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myVideoStream = stream;
		addVideoStream(myVideo, stream);
		myPeer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				addVideoStream(video, userVideoStream);
			});
		});
		socket.on("user-connected", (userId) => {
			connectToNewUser(userId, stream);
		});
		let text = $("input");
		$("html").keydown(function (e) {
			if (e.which == 13 && text.val().length !== 0) {
				socket.emit("message", text.val());
				text.val("");
			}
		});

		socket.on("createMessage", (message) => {
			$("ul").append(
				'<li class="message"><b>user</b><br/>' + message + "</li>"
			);
			scrollToButton();
		});
	});

socket.on("user-disconnected", (userId) => {
	if (peers[userId]) {
		peers[userId].close();
	}
});

myPeer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
	const call = myPeer.call(userId, stream);
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});
	call.on("close", () => {
		video.remove();
	});
	peers[userId] = call;
}

function addVideoStream(video, stream) {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
	});
	videoGrid.append(video);
}

const scrollToButton = () => {
	const element = document.querySelector(".main__chat_window");
	if (element) {
		element.scrollTop = element.scrollHeight;
	}
};

function muteUnmute() {
	console.log("object");
	let enabled = myVideoStream.getAudioTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		setUnmuteButton();
	} else {
		setMuteButton();
		myVideoStream.getAudioTracks()[0].enabled = true;
	}
}

function playStop() {
	console.log("object");
	let enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		setPlayVideo();
	} else {
		setStopVideo();
		myVideoStream.getVideoTracks()[0].enabled = true;
	}
}

const setStopVideo = () => {
	const element = document.querySelector(".main__video_button");
	if (element) {
		const html = `<i class="fas fa-video"></i><span> Stop Video</span>`;
		element.innerHTML = html;
	}
};

const setPlayVideo = () => {
	const element = document.querySelector(".main__video_button");
	if (element) {
		const html =
			`<i class="stop fas fa-video-slash"></i><span> Play Video</span>`;
		element.innerHTML = html;
	}
};

const setMuteButton = () => {
	const element = document.querySelector(".main__mute_button");
	if (element) {
		const html = `<i class="fas fa-microphone"></i><span>Mute</span>`;
		element.innerHTML = html;
	}
};

const setUnmuteButton = () => {
	const element = document.querySelector(".main__mute_button");
	if (element) {
		const html =
			`<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>`;
		element.innerHTML = html;
	}
};







