import bcrypt from "bcrypt";
import mongoose from "mongoose";

const isHeroku = process.env.NODE_ENV === "production";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: {
    type: String,
    default: isHeroku
      ? "/images/default-avatar.jpeg"
      : "uploads/default-avatar.jpeg",
  },
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  likes: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  ],
});

// middleware which execute before "save"
userSchema.pre("save", async function () {
  // password가 변경되었을때 true -> hash password
  if (this.isModified("password")) {
    // 이 함수에서 this는 create되는 user이다.
    this.password = await bcrypt.hash(this.password, 5); // hash()함수의 두 번째 인자는 hash 횟수이다.
  }
});

const User = mongoose.model("User", userSchema);

export default User;
