import express from "express";

const PORT = 4000;

// create express application
const app = express();

const handleHome = (req, res) => {
  return res.send("<h1>Home!</h1>");
};
const handleLogin = (req, res) => {
  return res.send({ message: "Login here." });
};
app.get("/", handleHome);
app.get("/login", handleLogin);

// listening
const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
