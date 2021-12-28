import express from "express";
import { join, login } from "../controllers/userController";
import { trending } from "../controllers/videoController";

const globerRouter = express.Router();

globerRouter.get("/", trending);
globerRouter.get("/join", join);
globerRouter.get("/login", login);

export default globerRouter;
