import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdAt: Date,
  hastags: [{ type: String }],
  meta: {
    view: Number,
    rating: Number,
  },
});

const movieModel = mongoose.model("Video", videoSchema);
export default movieModel;
