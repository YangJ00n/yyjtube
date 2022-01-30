const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");

let volumeValue = 0.5;
video.volume = volumeValue;

// is video paused before timeline change.
let isVideoPausedBefore;
let isTimelineSetEnd = true;

const handlePlay = () => {
  playBtn.innerText = "Pause";
};

const handlePause = () => {
  playBtn.innerText = "Play";
};

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  // playBtn.innerText = video.paused ? "Play" : "Pause";
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

const formatTime = (seconds) => {
  const startIdx = seconds >= 3600 ? 11 : 14;
  return new Date(seconds * 1000).toISOString().substring(startIdx, 19);
};

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;

  if (isTimelineSetEnd) {
    isVideoPausedBefore = video.paused ? true : false;
    isTimelineSetEnd = false;
  }
  video.pause();
};

const handleTimelineSet = () => {
  console.log(isVideoPausedBefore);
  if (!isVideoPausedBefore) video.play();
  isTimelineSetEnd = true;
};

video.addEventListener("play", handlePlay);
video.addEventListener("pause", handlePause);

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
timeline.addEventListener("change", handleTimelineSet);
