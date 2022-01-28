const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");

let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleMute = () => {
  if (volumeValue !== 0) {
    if (video.muted) {
      video.muted = false;
    } else {
      video.muted = true;
    }
    muteBtn.innerText = video.muted ? "Unmute" : "Mute";
    volumeRange.value = video.muted ? 0 : volumeValue;
  }
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;

  volumeValue = Number(value);
  video.volume = volumeValue;

  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  } else if (!video.muted && volumeValue === 0) {
    video.muted = true;
    muteBtn.innerText = "Unmute";
  }
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
