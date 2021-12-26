import express from "express";
import morgan from "morgan";

const PORT = 4000;

// create express application
const app = express();

const logger = morgan("dev"); // morgan return middleware
app.use(logger);

const handleHome = (req, res) => {
  return res.send("I love middlewares");
};

app.get("/", handleHome);

// listening
const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
