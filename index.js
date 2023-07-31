const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const themeModel = require("./model/themeModel");
const User = require("./model/userModel");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ message: "Logedin Successfully", user });
    } else {
      const user = new User({ username, password });
      await user.save();
      res.json({ message: "Logedin Successfully", user });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

app.get("/setting/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const config = await themeModel.findOne({ userID: userId });
    if (config) {
      res.json(config);
    } else {
      const defaultConfig = {
        backgroundColor: "#f5f5f5",
        primaryColor: "#ff0000",
        secondaryColor: "#00ff00",
        textColor: "#000000",
        fontSize: 16,
      };
      res.json(defaultConfig);
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving color configuration" });
  }
});

app.put("/setting/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const {
      backgroundColor,
      primaryColor,
      secondaryColor,
      textColor,
      fontSize,
    } = req.body;

    const config = await themeModel.findOne({ userID: userId });
    if (config) {
      const updatedTheme = await themeModel.findOneAndUpdate(
        { userID: userId },
        {
          backgroundColor,
          primaryColor,
          secondaryColor,
          textColor,
          fontSize,
        },
        { new: true, upsert: true }
      );
      io.to(userId).emit("themeConfigUpdate", updatedTheme);
      res.json(updatedTheme);
    } else {
      const newTheme = new themeModel({
        userID: userId,
        backgroundColor,
        primaryColor,
        secondaryColor,
        textColor,
        fontSize,
      });
      await newTheme.save();
      io.to(userId).emit("themeConfigUpdate", newTheme);
      res.json(newTheme);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating color configuration" });
  }
});

io.on("connection", (socket) => {
  socket.on("updateThemeConfig", async (data) => {
    const { userId, updatedConfig } = data;
    try {
      await themeModel.findOneAndUpdate({ userID: userId }, updatedConfig, {
        new: true,
        upsert: true,
      });
      socket.to(userId).emit("themeConfigUpdate", updatedConfig);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

http.listen(process.env.port || 8080, async () => {
  try {
    await connection;
    console.log("connected to database");
  } catch (error) {
    console.log("Unable to connect");
  }
});
