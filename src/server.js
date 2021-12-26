import express from "express";
import morgan from "morgan";
import globerRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const PORT = 4000;

// create express application
const app = express();

const logger = morgan("dev"); // morgan return middleware
app.use(logger);

app.use("/", globerRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

// listening
const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
