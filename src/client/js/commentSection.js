const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (text, comment) => {
  const videoComments = document.querySelector(".video__comments-list");
  const newComment = document.createElement("li");
  newComment.className = "comment-mixin";

  const a = document.createElement("a");
  a.href = `/users/${comment.owner._id}`;
  const avatar = document.createElement("img");
  avatar.className = "comment-mixin__avatar";
  const avatarUrl = comment.owner.avatarUrl;
  avatar.src = avatarUrl.includes("github") ? avatarUrl : `/${avatarUrl}`;
  a.appendChild(avatar);

  const div = document.createElement("div");
  div.dataset.id = comment._id;
  const metaDiv = document.createElement("div");
  metaDiv.className = "comment-mixin__meta";
  const owner = document.createElement("span");
  owner.innerText = comment.owner.name;
  const createdAt = document.createElement("span");
  createdAt.innerText = new Date(comment.createdAt).toLocaleString("ko-kr");
  metaDiv.appendChild(owner);
  metaDiv.appendChild(createdAt);
  div.appendChild(metaDiv);

  const span = document.createElement("span");
  span.innerText = text;
  span.className = "comment-mixin__title";
  div.appendChild(span);

  newComment.appendChild(a);
  newComment.appendChild(div);

  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }

  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // 전송된 텍스트가 json이라는 것을 백엔드에 인식시켜 준다.
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    textarea.value = "";
    const { comment } = await response.json();
    addComment(text, comment);
  }
};

if (form) form.addEventListener("submit", handleSubmit);
