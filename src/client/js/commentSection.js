const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const btn = form.querySelector("button");
const deleteBtns = document.querySelectorAll(".comment__delete");

const addComment = (text, comment) => {
  const videoComments = document.querySelector(".video__comments-list");
  const newComment = document.createElement("li");
  newComment.className = "comment-mixin";

  const a = document.createElement("a");
  a.href = `/users/${comment.owner._id}`;
  const avatar = document.createElement("img");
  avatar.className = "comment-mixin__avatar";
  const avatarUrl = comment.owner.avatarUrl;
  avatar.src = avatarUrl.includes("images") ? avatarUrl : `/${avatarUrl}`;
  a.appendChild(avatar);

  const dataDiv = document.createElement("div");
  dataDiv.className = "comment-mixin__data";
  dataDiv.dataset.id = comment._id;
  const metaDiv = document.createElement("div");
  metaDiv.className = "comment-mixin__meta";
  const owner = document.createElement("span");
  owner.innerText = comment.owner.name;
  owner.className = "comment-mixin__name";

  const div = document.createElement("div");
  const createdAt = document.createElement("span");
  createdAt.innerText = "방금 전";
  const separater = document.createElement("span");
  separater.innerText = " • ";
  const deleteBtn = document.createElement("span");
  deleteBtn.className = "comment__delete";
  deleteBtn.innerText = "Delete";
  deleteBtn.addEventListener("click", handleDelete);
  div.appendChild(createdAt);
  div.appendChild(separater);
  div.appendChild(deleteBtn);

  metaDiv.appendChild(owner);
  metaDiv.appendChild(div);
  dataDiv.appendChild(metaDiv);

  const span = document.createElement("span");
  span.innerText = text;
  span.className = "comment-mixin__text";
  dataDiv.appendChild(span);

  newComment.appendChild(a);
  newComment.appendChild(dataDiv);

  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  btn.disabled = true;
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
  btn.disabled = false;
};

const handleDelete = async (event) => {
  event.target.removeEventListener("click", handleDelete);
  const dataDiv = event.target.parentElement.parentElement.parentElement;
  const commentId = dataDiv.dataset.id;
  const videoId = videoContainer.dataset.id;

  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ videoId }),
  });

  if (response.status === 201) {
    dataDiv.parentElement.remove();
  } else {
    event.target.addEventListener("click", handleDelete);
  }
};

if (form) form.addEventListener("submit", handleSubmit);

deleteBtns.forEach((btn) => btn.addEventListener("click", handleDelete));
