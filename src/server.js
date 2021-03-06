// server.js에서는 express와 server의 구성에 관련있는 코드만 처리

import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

// create express application
const app = express();
const logger = morgan("dev"); // morgan return middleware

app.set("view engine", "pug"); // set view engine as pug
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true })); // form의 value들을 이해할 수 있도록 하고, JS 형식으로 변형시켜준다.
app.use(express.json()); // post했을 때 body내의 string을 받아서 json으로 바꿔준다.

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false, // 세션을 수정할 때만 세션을 DB에 저장 -> 로그인한 사용자에게만 쿠키를 준다.
    // cookie: {
    //   maxAge: 20000, // 쿠키 만료 시간 설정 (밀리세컨드)
    // },
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

app.use(flash()); // flash middleware는 messages라고 하는 locals를 사용할 수 있게 한다.
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); // static files serving 활성화 -> 브라우저가 uploads 폴더에 접근할 수 있도록 한다.
app.use(
  "/static",
  express.static("assets"),
  express.static("node_modules/@ffmpeg/core/dist")
);
app.use("/images", express.static("src/images"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
