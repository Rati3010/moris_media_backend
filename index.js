const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const themeModel = require("./model/themeModel");
const User = require("./model/userModel");
const app = express();
const http = require("http").createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.send("Hey, How are you");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ message: "Logedin Successfully", user });
      console.log(user);
    } else {
      const user = new User({ username, password });
      await user.save();
      console.log(user);
      res.json({ message: "Logedin Successfully", user });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

app.get("/setting/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const config = await themeModel.findOne({ userId });
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
  console.log(userId);
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
      const updateTheme = await themeModel.findOneAndUpdate(
        { userID: userId },
        { backgroundColor, primaryColor, secondaryColor, textColor, fontSize },
        { new: true, upsert: true }
      );
      res.json(updateTheme);
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
      res.json(newTheme);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating color configuration" });
  }
});

http.listen(process.env.port || 8080, async () => {
  try {
    await connection;
    console.log("connected to database");
  } catch (error) {
    console.log("Unable to connect");
  }
});
