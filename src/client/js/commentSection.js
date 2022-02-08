const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // 전송된 텍스트가 json이라는 것을 백엔드에 인식시켜 준다.
    },
    body: JSON.stringify({ text }),
  });
  textarea.value = "";
};

if (form) form.addEventListener("submit", handleSubmit);
