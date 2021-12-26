import express from "express";
import { join } from "../controllers/userController";
import { trending } from "../controllers/videoController";

const globerRouter = express.Router();

globerRouter.get("/", trending);
globerRouter.get("/join", join);

export default globerRouter;
