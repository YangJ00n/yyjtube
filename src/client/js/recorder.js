import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");
const micBtn = document.getElementById("mic");
const micIcon = micBtn.querySelector("i");

let stream;
let recorder;
let videoFile;

let mp4Url;
let thumbUrl;

let isMicOn = false;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const downloadFiles = () => {
  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({
    log: true,
    corePath: "/static/ffmpeg-core.js",
  });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  // webm을 mp4로 변환
  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  // 00:00:01 시간대를 찾고 1장의 스크린샷을 찍는다.
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  mp4Url = URL.createObjectURL(mp4Blob);
  thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFiles();

  // 브라우저가 느려지는 것을 방지하기 위해 파일의 링크를 제거한다.
  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(videoFile);
  // URL.revokeObjectURL(mp4Url);
  // URL.revokeObjectURL(thumbUrl);

  actionBtn.addEventListener("click", downloadFiles);
  actionBtn.innerText = "Download Recording";
  actionBtn.disabled = false;
};

const handleStop = () => {
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);

  recorder.stop();
};

const handleStart = async () => {
  if (isMicOn) await _getUserMedia();

  micBtn.classList.add("none");
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStart);
  setTimeout(() => {
    actionBtn.addEventListener("click", handleStop);
  }, 1500);

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    // console.log(event.data);
    // createObjectURL : 파일이 있는 브라우저의 메모리를 가리키고 있는 URL을 생성한다.
    videoFile = URL.createObjectURL(event.data);
    // console.log(videoFile);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const handleMic = () => {
  isMicOn = !isMicOn;
  micIcon.classList = isMicOn ? "fas fa-microphone" : "fas fa-microphone-slash";
};

const _getUserMedia = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: isMicOn,
    video: {
      width: 1024,
      height: 576,
    },
  });
};

const init = async () => {
  actionBtn.removeEventListener("click", init);

  await _getUserMedia();
  video.srcObject = stream;
  video.play();

  video.classList.remove("none");
  micBtn.classList.remove("none");
  actionBtn.innerText = "Start Recording";
  actionBtn.addEventListener("click", handleStart);
};

actionBtn.addEventListener("click", init);
micBtn.addEventListener("click", handleMic);
