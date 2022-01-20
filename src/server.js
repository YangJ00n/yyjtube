// server.js에서는 express와 server의 구성에 관련있는 코드만 처리

import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

// create express application
const app = express();
const logger = morgan("dev"); // morgan return middleware

app.set("view engine", "pug"); // set view engine as pug
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true })); // form의 value들을 이해할 수 있도록 하고, JS 형식으로 변형시켜준다.
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
