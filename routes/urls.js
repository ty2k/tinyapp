const express = require("express");
const router = express.Router();
const getRandomString = require("../utils/random-string").generateRandomString;
const getUrlsForUser = require("../utils/urls-for-user").urlsForUser;
const users = require("../db/users");
const urlDatabase = require("../db/urls");

// Show urls_index at /urls
router.get("/", (req, res) => {
  // Create an empty urls object to pass to non-authenticated users
  let urlsToDisplay = {};
  // If a user is authenticated, show them the urls they have created
  if (req.session.user_id) {
    urlsToDisplay = getUrlsForUser(req.session.user_id);
  }
  let templateVars = {
    urls: urlsToDisplay,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

// Create new URL page urls_new at /urls/new
// Put /urls/new ahead of /urls/:id so that "new" isn't treated as a short URL id
router.get("/new", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  // If a user is authenticated, send them to the new URL page
  if (users[req.session["user_id"]]) {
    return res.render("urls_new", templateVars);
    // Else, send non-authenticated users to /login
  } else {
    res.redirect("/login");
  }
});

// GET route to urls_show view (page to edit a URL's details)
router.get("/:id", (req, res) => {
  // If the requested URL isn't in our database, set templateVars as such
  if (!urlDatabase[req.params.id]) {
    let templateVars = {
      shortURL: req.params.id,
      fullURL: undefined,
      urlUserID: undefined,
      user: users[req.session["user_id"]]
    };
    return res.render("urls_show", templateVars);
    // Else if the URL is in our database, set the templateVars with its data
  } else {
    let templateVars = {
      shortURL: req.params.id,
      fullURL: urlDatabase[req.params.id].url,
      urlUserID: urlDatabase[req.params.id].userID,
      user: users[req.session["user_id"]]
    };
    res.render("urls_show", templateVars);
  }
});

// POST route for new URLs being shortened
router.post("/", (req, res) => {
  // If our user is authenticated, let me make a new short URL
  if (req.session["user_id"]) {
    let newRandomString = getRandomString();
    urlDatabase[newRandomString] = {
      id: newRandomString,
      userID: req.body.userID,
      url: req.body.longURL
    };
    // Redirect to page where user can edit the URL's details (GET /urls/:id)
    return res.redirect("/urls/" + newRandomString);
    // Else throw an error asking the user to register or log in.
  } else {
    res.end("<html><head><title>TinyApp: Error</title></head><body>Unfortunately, you can't make a new short URL unless you are logged in. <a href='/register'>Register</a> or <a href='/login'>login</a>.</body></html>\n");
  }
});

// POST route to change an existing shortened URL
router.post("/:id", (req, res) => {
  // If our user is authenticated and owns the URL, let them update it
  if (req.session["user_id"] && req.session["user_id"] === urlDatabase[req.body.shortURL].userID) {
    let fullURL = req.body.newLongURL;
    let shortURL = req.body.shortURL;
    urlDatabase[req.body.shortURL].url = req.body.newLongURL;
    // Redirect back to the urls index page
    return res.redirect("/urls");
  } else {
    res.end("<html><head><title>TinyApp: Error</title></head><body>Unfortunately, you can only change URLs you created. <a href='/register'>Register</a> or <a href='/login'>login</a>.</body></html>\n");
  }
});

// POST route for deleting existing shortened URLs
router.post("/:id/delete", (req, res) => {
  // If user is authenticated and created the link, delete URL and return to /urls
  if (urlDatabase[req.params.id].userID === users[req.session["user_id"]].id) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
    // Else, error
  } else {
    res.end("<html><head><title>TinyApp: Error</title></head><body>I'm not sure what you're doing here, but please stop trying to delete things you don't own! Please <a href='/register'>register</a> or <a href='/login'>login</a>.</body></html>\n");
  }
});

module.exports = router;
