require('dotenv').config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const movieRoutes = require("./src/routes/movies.routes");
const reviewRoutes = require("./src/routes/reviews.routes");
const clubRoutes = require("./src/routes/clubs.routes");
const voteRoutes = require("./src/routes/votes.routes");
const userRoutes = require("./src/routes/users.routes");
const { initVoteSocket } = require("./src/websocket/voteSocket");
const uploadHandler = require("./src/routes/upload.routes");
const authMiddleware = require('./src/middleware/auth.middleware')
const postRoutes = require("./src/routes/posts.routes");
const cors = require('cors');



const PORT = process.env.PORT

connectDB();
initVoteSocket(server);

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/movies", reviewRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/uploadthing", uploadHandler);
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes);


if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app
