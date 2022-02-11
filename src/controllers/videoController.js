import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";

export const getElapsedTime = (createdAt, now) => {
  let gap = (now - createdAt) / 1000;
  if (gap < 60) {
    gap = Math.floor(gap);
    return gap === 0 ? "방금 전" : `${gap}초 전`;
  }

  gap /= 60;
  if (gap < 60) return `${Math.floor(gap)}분 전`;

  gap /= 60;
  if (gap < 24) return `${Math.floor(gap)}시간 전`;

  gap /= 24;
  if (gap < 7) return `${Math.floor(gap)}일 전`;

  gap /= 7;
  if (gap < 365 / 12 / 7) return `${Math.floor(gap)}주 전`;

  gap = (gap * 7) / (365 / 12);
  if (gap < 12) return `${Math.floor(gap)}개월 전`;

  gap /= 12;
  return `${Math.floor(gap)}년 전`;
};

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" }) // asc:오름차순, desc:내림차순
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos, getElapsedTime });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  // populate("owner") -> owner의 ObjectId를 실제 데이터로 변환한다.
  const video = await Video.findById(id).populate("owner");
  // console.log(video);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }

  let comments = [];
  for (const commentId of video.comments) {
    comments.push(await Comment.findById(commentId).populate("owner"));
  }

  return res.render("videos/watch", {
    pageTitle: video.title,
    video,
    comments,
    getElapsedTime,
  });
};

export const getEdit = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of this video.");
    return res.status(403).redirect("/");
  }
  return res.render("videos/edit-video", {
    pageTitle: `Edit: ${video.title}`,
    video,
  });
};
export const postEdit = async (req, res) => {
  const {
    params: { id },
    body: { title, description, hashtags },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of this video.");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Change Saved!");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  // ffmpeg 에러 : Uncaught (in promise) ReferenceError: SharedArrayBuffer is not defined 을 해결하기 위한 코드
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");

  res.render("videos/upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { title, description, hashtags },
    files: { video, thumb },
  } = req;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });

    const user = await User.findById(_id);
    user.videos.unshift(newVideo._id);
    user.save();

    req.flash("success", "Video Uploaded!");
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    req.flash("success", "Fail to Upload.");
    return res
      .status(400)
      .render("videos/upload", { pageTitle: "Upload Video" });
  }
};

export const deleteVideo = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id).populate("comments");
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of this video.");
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndDelete(id);
  for (const comment of video.comments) {
    await Comment.findByIdAndDelete(comment._id);
  }
  for (const likedUserId of video.meta.likes) {
    const user = await User.findById(likedUserId);
    const idx = user.likes.indexOf(id);
    user.likes.splice(idx, 1);
    await user.save();
  }

  req.flash("success", "Video deleted!");
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("videos/search", {
    pageTitle: "Search",
    videos,
    getElapsedTime,
  });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404); // sendStatus()는 상태 코드를 보내고 연결을 끝낸다.
  }
  video.meta.views += 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }

  const newComment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });

  video.comments.push(newComment._id);
  await video.save();

  const comment = await Comment.findById(newComment._id).populate("owner");

  return res.status(201).json({ comment });
};

export const deleteComment = async (req, res) => {
  const {
    session: { user },
    body: { videoId },
    params: { id: commentId },
  } = req;

  const video = await Video.findById(videoId);
  if (!video) {
    return res.sendStatus(404);
  }

  const idx = video.comments.indexOf(commentId);
  if (idx === -1) {
    return res.sendStatus(404);
  }

  const comment = await Comment.findById(commentId).populate("owner");
  if (!comment) {
    return res.sendStatus(404);
  }

  if (String(user._id) !== String(comment.owner._id)) {
    return res.sendStatus(403);
  }

  video.comments.splice(idx, 1);
  await video.save();

  await Comment.findByIdAndDelete(commentId);

  return res.sendStatus(201);
};

export const seeHashtag = async (req, res) => {
  const { hashtag } = req.params;
  const videos = await Video.find({
    hashtags: { $elemMatch: { $in: [hashtag] } },
  })
    .sort({ createdAt: "desc" })
    .populate("owner");

  return res.render("videos/hashtag", {
    pageTitle: `#${hashtag}`,
    videos,
    hashtag,
    getElapsedTime,
  });
};

export const registerLike = async (req, res) => {
  const {
    session: {
      user: { _id: userId },
    },
    params: { id: videoId },
  } = req;

  const video = await Video.findById(videoId);
  if (!video) {
    return res.sendStatus(404);
  }

  const idx = video.meta.likes.indexOf(userId);
  if (idx !== -1) {
    return res.sendStatus(403);
  }

  video.meta.likes.push(userId);
  await video.save();

  const user = await User.findById(userId);
  user.likes.push(videoId);
  await user.save();

  return res.sendStatus(200);
};

export const removeLike = async (req, res) => {
  const {
    session: {
      user: { _id: userId },
    },
    params: { id: videoId },
  } = req;

  const video = await Video.findById(videoId);
  if (!video) {
    return res.sendStatus(404);
  }

  let idx = video.meta.likes.indexOf(userId);
  if (idx === -1) {
    return res.sendStatus(403);
  }

  video.meta.likes.splice(idx, 1);
  await video.save();

  const user = await User.findById(userId);
  idx = user.likes.indexOf(videoId);
  user.likes.splice(idx, 1);
  await user.save();

  return res.sendStatus(200);
};
