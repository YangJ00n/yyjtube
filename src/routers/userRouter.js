import express from "express";
import {
  getEdit,
  postEdit,
  logout,
  seeProfile,
  startGithubLogin,
  finishGithubLogin,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  avatarUpload,
  s3DeleteFile,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(s3DeleteFile, avatarUpload.single("avatar"), postEdit); // input name이 avatar인 파일을 찾아서 저장 후 그 파일에 대한 정보를 postEdit으로 넘겨준다.
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

userRouter.get("/:id", seeProfile);

export default userRouter;
