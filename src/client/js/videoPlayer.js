const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
video.volume = 0.5;
// is video paused before timeline change.
let isVideoPausedBefore;
let isTimelineSetEnd = true;

const handlePlay = () => {
  playBtnIcon.classList = "fas fa-pause";
};

const handlePause = () => {
  playBtnIcon.classList = "fas fa-play";
};

const handleVolume = () => {
  if (!video.muted) {
    muteBtnIcon.classList =
      video.volume < 0.5 ? "fas fa-volume-down" : "fas fa-volume-up";
  } else {
    muteBtnIcon.classList = "fas fa-volume-mute";
  }
};

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
};

const handleMute = () => {
  if (video.volume !== 0) {
    if (video.muted) {
      video.muted = false;
    } else {
      video.muted = true;
    }
    volumeRange.value = video.muted ? 0 : video.volume;
  }
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;

  video.volume = Number(value);

  if (video.muted) {
    video.muted = false;
  } else if (!video.muted && video.volume === 0) {
    video.muted = true;
  }
};

const formatTime = (seconds) => {
  const startIdx = seconds >= 3600 ? 11 : 14;
  return new Date(seconds * 1000).toISOString().substring(startIdx, 19);
};

const handleLoadedData = () => {
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

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsTimeout = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 1000);
};

video.addEventListener("play", handlePlay);
video.addEventListener("pause", handlePause);
video.addEventListener("volumechange", handleVolume);

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadeddata", handleLoadedData);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
timeline.addEventListener("change", handleTimelineSet);
fullScreenBtn.addEventListener("click", handleFullscreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
