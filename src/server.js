import express from "express";
import morgan from "morgan";
import globerRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const PORT = 4000;

// create express application
const app = express();
const logger = morgan("dev"); // morgan return middleware

app.set("view engine", "pug"); // set view engine as pug
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true })); // form의 value들을 이해할 수 있도록 하고, JS 형식으로 변형시켜준다.
app.use("/", globerRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

// listening
const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
