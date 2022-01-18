import express from "express";
import { join, login } from "../controllers/userController";
import { home, search } from "../controllers/videoController";

const globerRouter = express.Router();

globerRouter.get("/", home);
globerRouter.get("/join", join);
globerRouter.get("/login", login);
globerRouter.get("/search", search);

export default globerRouter;
