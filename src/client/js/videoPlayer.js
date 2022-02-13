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
const playbackRate = document.getElementById("playbackRate");
const textarea = document.querySelector("textarea");
const deleteBtn = document.getElementById("deleteVideo");

let controlsTimeout = null;
let isVideoPausedBefore; // is video paused before timeline change.
let isTimelineSetEnd = true;

const handlePlay = () => {
  playBtnIcon.classList = "fas fa-pause";
  hideControlsTimeout();
  video.addEventListener("mousemove", handleMouseMove);
  videoContainer.addEventListener("mouseleave", handleMouseLeave);
};

const handlePause = () => {
  playBtnIcon.classList = "fas fa-play";
  showControls();
  video.removeEventListener("mousemove", handleMouseMove);
  videoContainer.removeEventListener("mouseleave", handleMouseLeave);
};

const handleVolume = () => {
  if (video.muted || video.volume === 0) {
    muteBtnIcon.classList = "fas fa-volume-mute";
  } else {
    muteBtnIcon.classList =
      video.volume < 0.5 ? "fas fa-volume-down" : "fas fa-volume-up";
  }
  volumeRange.value = video.muted ? 0 : video.volume;
  localStorage.setItem("volume", video.muted ? 0 : video.volume);
};

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
};

const handleMuteClick = () => {
  if (video.volume !== 0) {
    video.muted = !video.muted;
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

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = video.currentTime;
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
  if (!isVideoPausedBefore) video.play();
  isTimelineSetEnd = true;
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
    video.classList.remove("fullscreen");
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
    video.classList.add("fullscreen");
  }
};

const showControls = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  videoControls.classList.add("showing");
  videoContainer.classList.remove("hideCursor");
};

const hideControls = () => videoControls.classList.remove("showing");

const hideControlsTimeout = () => {
  controlsTimeout = setTimeout(() => {
    hideControls();
    videoContainer.classList.add("hideCursor");
  }, 3000);
};

const handleMouseMove = () => {
  showControls();
  hideControlsTimeout();
};

const handleMouseLeave = () => {
  hideControls();
};

const handleMouseEnterControls = () => {
  showControls();
};

const handleKeyControls = (key) => {
  if (!video.paused) {
    showControls();
    hideControlsTimeout();
  }

  if (key === "Space" || key === "KeyK") handlePlayClick();
  else if (key === "KeyM") handleMuteClick();
  else if (key === "KeyF") handleFullscreen();
  else if (key === "ArrowRight") video.currentTime += 5;
  else if (key === "ArrowLeft") video.currentTime -= 5;
  else if (key === "KeyL") video.currentTime += 10;
  else if (key === "KeyJ") video.currentTime -= 10;
  else if (key === "ArrowUp")
    video.volume = +(video.volume > 0.9 ? 1 : video.volume + 0.1).toFixed(1);
  else if (key === "ArrowDown")
    video.volume = +(video.volume < 0.1 ? 0 : video.volume - 0.1).toFixed(1);
};

const handleKeydown = (event) => {
  const { code } = event;
  // console.log(code);
  if (event.target === textarea) return;
  const preventEventKeyList = [
    "Space",
    "ArrowRight",
    "ArrowLeft",
    "ArrowUp",
    "ArrowDown",
  ];
  if (preventEventKeyList.indexOf(code) !== -1) event.preventDefault();
  handleKeyControls(code);
};

const handlePlaybackRate = () => {
  video.playbackRate = playbackRate.value;
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

const setVolume = () => {
  const volume = localStorage.getItem("volume");
  video.volume = volume ? volume : 0.5;
};

const handleDeleteVideo = () => {
  const href = deleteBtn.href;
  if (href) {
    deleteBtn.removeAttribute("href");
    deleteBtn.innerText = "Deleting now...";
    window.location = href;
  }
};

setVolume();

video.addEventListener("play", handlePlay);
video.addEventListener("pause", handlePause);
video.addEventListener("volumechange", handleVolume);

playBtn.addEventListener("click", handlePlayClick);
video.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
timeline.addEventListener("change", handleTimelineSet);
fullScreenBtn.addEventListener("click", handleFullscreen);
video.addEventListener("dblclick", handleFullscreen);
videoControls.addEventListener("mouseenter", handleMouseEnterControls);
window.addEventListener("keydown", handleKeydown);
playbackRate.addEventListener("change", handlePlaybackRate);
deleteBtn.addEventListener("click", handleDeleteVideo);

if (video.readyState === 4) {
  handleLoadedMetadata();
}
