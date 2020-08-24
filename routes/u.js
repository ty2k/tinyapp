const express = require("express");
const router = express.Router();
const users = require("../db/users");
const urlDatabase = require("../db/urls");

// GET route for redirection out
router.get("/:shortURL", (req, res) => {
  // If the shortURL is invalid, display an error page
  if (!urlDatabase[req.params.shortURL]) {
    let templateVars = {
      user: users[req.session.user_id]
    };
    return res.render("urls_invalid", templateVars);
    // Otherwise direct to the long URL
  } else {
    let longURL = urlDatabase[req.params.shortURL].url;
    res.redirect(longURL);
  }
});

module.exports = router;
