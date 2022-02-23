const mainWatch = document.getElementById("mainWatch");
const main = mainWatch.parentNode;
const deleteBtn = document.getElementById("deleteVideo");

const setMainMargin = () => {
  // width가 600px보다 작을 경우 main태그 margin 0으로
  if (window.innerWidth <= 600) {
    main.classList.add("no-margin");
  } else {
    main.classList.remove("no-margin");
  }
};

const handleResize = () => {
  setMainMargin();
};

const handleDeleteVideo = () => {
  const videoContainer = document.getElementById("videoContainer");
  const { id } = videoContainer.dataset;
  const ok = confirm("Deleting is irreversible. do you want to delete?");
  if (ok) {
    deleteBtn.removeEventListener("click", handleDeleteVideo);
    deleteBtn.innerText = "Deleting now...";
    window.location = `${id}/delete`;
  }
};

setMainMargin();

window.addEventListener("resize", handleResize);
if (deleteBtn) {
  deleteBtn.addEventListener("click", handleDeleteVideo);
}
