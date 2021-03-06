import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 60 },
  fileUrl: { type: String, required: true },
  thumbUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
  },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

// static function
videoSchema.static("formatHashtags", function (hashtags) {
  let results = [];
  hashtags.split(",").map((word) => {
    word = word.replaceAll(" ", "").toLowerCase();
    word = word.indexOf("#") !== -1 ? word.replaceAll("#", "") : word;
    if (results.indexOf(word) === -1) results.push(word);
  });
  return results;
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
