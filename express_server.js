// Express server and requirements
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
const linkOutRoutes = require("./routes/u");
const urlRoutes = require("./routes/urls");
const userRoutes = require("./routes/user");
let cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["anexamplekey", "anotherexamplekey"],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/user/login");
    // If user is authenticated, go to their index of shortened URLs
  } else {
    res.redirect("/urls");
  }
});
app.use("/u", linkOutRoutes);
app.use("/urls", urlRoutes);
app.use("/user", userRoutes);

// Persistent listener
app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}.`);
});
