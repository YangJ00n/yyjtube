const likeBtn = document.getElementById("like");
const like = document.querySelector(".like");
const likesCnt = document.getElementById("likesCnt");

const handleRegister = async () => {
  const { id } = videoContainer.dataset;
  const { status } = await fetch(`/api/videos/${id}/like`, {
    method: "POST",
  });
  if (status === 200) {
    likeBtn.classList.add("like");
    const cnt = Number(likesCnt.innerText);
    likesCnt.innerText = ` ${cnt + 1}`;

    likeBtn.removeEventListener("click", handleRegister);
    likeBtn.addEventListener("click", handleRemove);
  }
};

const handleRemove = async () => {
  const { id } = videoContainer.dataset;
  const { status } = await fetch(`/api/videos/${id}/removelike`, {
    method: "POST",
  });
  if (status === 200) {
    likeBtn.classList.remove("like");
    const cnt = Number(likesCnt.innerText);
    likesCnt.innerText = ` ${cnt - 1}`;

    likeBtn.removeEventListener("click", handleRemove);
    likeBtn.addEventListener("click", handleRegister);
  }
};

if (like) likeBtn.addEventListener("click", handleRemove);
else likeBtn.addEventListener("click", handleRegister);
