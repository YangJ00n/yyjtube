const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const video = videoContainer.dataset.id;
};

if (form) form.addEventListener("submit", handleSubmit);
