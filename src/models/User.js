import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  location: String,
});

// middleware which execute before "save"
userSchema.pre("save", async function () {
  // 이 함수에서 this는 create되는 user이다.
  this.password = await bcrypt.hash(this.password, 5); // hash()함수의 두 번째 인자는 hash 횟수이다.
});

const User = mongoose.model("User", userSchema);

export default User;
