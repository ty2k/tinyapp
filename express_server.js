"use strict";

const express = require("express");
var cookieSession = require("cookie-session");
const app = express();
app.use(cookieSession({
  name: "session",
  keys: [ "key1", "key2" ],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const PORT = process.env.PORT || 8080; // default port 8080

const bcrypt = require("bcrypt");

app.set("view engine", "ejs")

// Require body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Instead of an actual URL database, use a dummy database object for now
const urlDatabase = {
  "b2xVn2": {
    id: "b2xVn2",
    userID: "userRandomID",
    url: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    id: "9sm5xK",
    userID: "user2RandomID",
    url: "http://www.google.com"
  }
};

// Instead of an actual user database, use a dummy database object for now
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "$2a$10$.h4h.MdXZ1dvfD1irSpW/eBFnw7W8zJ.hnwuRESc/CEl0f7N3drva",
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "$2a$10$RJtBCOtiQCZ4Mdh127m9GuRJkpnLs9Em6khLeBRuFDWPWbyUjFarS"
  }
};

// Hello at root
app.get("/", (req, res) => {
  res.end("Hello!");
});
// Show our JSON object at /urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// Hello world at /hello
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
// Show urls_index at /urls
app.get("/urls", (req, res) => {
  console.log("req.session.user_id: ");
  console.log(req.session.user_id);
  let urlsToDisplay = {};
  if (req.session.user_id === undefined) {
    urlsToDisplay = {};
  } else {
    urlsToDisplay = urlsForUser(req.session.user_id);
  }
  console.log("Urls to Display: ");
  console.log(urlsToDisplay);
  let templateVars = {
    urls: urlsToDisplay,
    user: users[req.session.user_id]
  };
  //console.log("Contents of req.cookies in GET /urls: ");
  //console.log(req.cookies);
  console.log("Contents of templateVars");
  console.log(templateVars.user);
  //console.log("templateVars at GET /urls:")
  //console.log(templateVars);
  //console.log("user variable: ");
  //console.log(templateVars.user);
  //console.log("Output of urlsForUser in GET /urls: ")
  //urlsForUser(users[req.cookies["user_id"]].id);
  res.render("urls_index", templateVars);
});
// Create new URL page urls_new at /urls/new
// Put /urls/new ahead of /urls/:id so that "new" isn't treated as a short URL id
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  console.log("templateVars in GET route to /urls/new: ");
  console.log(templateVars);
  if (users[req.session["user_id"]] !== undefined) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
// GET route to urls_show in form urls/:id
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id].url,
    urlUserID: urlDatabase[req.params.id].userID,
    user: users[req.session["user_id"]]
  };
  res.render("urls_show", templateVars);
});
// POST route for new URLs being shortened
app.post("/urls", (req, res) => {
  console.log("req.body for POST route to /urls: ");
  console.log(req.body);  // debug statement to see POST parameters
  let newRandomString = generateRandomString();
  urlDatabase[newRandomString] = {
    id: newRandomString,
    userID: req.body.userID,
    url: req.body.longURL
  };
  console.log("urlDatabase in POST route to /urls: ");
  console.log(urlDatabase);
  // Respond with a redirect to /urls/newRandomString
  res.redirect("/urls/" + newRandomString);
});
// GET route for login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  res.render("login", templateVars);
});
// POST route for logging in and becoming cookied
app.post("/login", (req, res) => {
  let existingEmails = [];
  let matchedUserId = "";
  // Fill an array with our existing emails
  for (let userId in users) {
    if (users.hasOwnProperty(userId)) {
      existingEmails.push(users[userId].email);
    }
  }
  // If the submitted email is not in the array, 403
  if (existingEmails.indexOf(req.body.email) === -1) {
    console.log("Email doesn't exist in database");
    res.status(403).send({ error: "Invalid email address or password" });
  } else { // If the submitted is in the array, get the ID associated with it
    for (let userId in users) {
      if (users.hasOwnProperty(userId)) {
        if (users[userId].email === req.body.email) {
          matchedUserId = userId;
        }
      }
    }
    // Check the matched ID hashed password against the submitted password that we will hash here. If the passwords match, redirected to /urls and set cookie
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    console.log(hashedPassword);
    if (bcrypt.compareSync(req.body.password, users[matchedUserId].hashedPassword)) {
      console.log("Password matches");
      req.session.user_id = matchedUserId;
      res.redirect("/urls");
    } else { // If the passwords don't match, 403
      console.log("Passwords don't match");
      res.status(403).send({ error: "Invalid email address or password" });
    }
  }
});
// POST route for deleting existing shortened URLs
app.post("/urls/:id/delete", (req, res) => {
  console.log("req.params of delete request: ");
  console.log(req.params);
  console.log(urlDatabase[req.params.id]);
  console.log("User who created the link: ");
  console.log(urlDatabase[req.params.id].userID); // userID who created the link
  console.log("User attempting to delete the link: ");
  console.log(users[req.session["user_id"]].id); // userID trying to delete
  if (urlDatabase[req.params.id].userID === users[req.session["user_id"]].id) {
    // Delete the URL from our urlDatabase object using its id as the key
    delete urlDatabase[req.params.id];
  }
  // Redirect back to the urls index page
  res.redirect("/urls");
});
// POST route to change an existing shortened URL
app.post("/urls/:id", (req, res) => {
  console.log("req.body in POST route to change a URL: ");
  console.log(req.body); // debug statement to see POST parameters
  let fullURL = req.body.newLongURL;
  let shortURL = req.body.shortURL;
  console.log("req.body.userID: ");
  console.log(req.body.userID);
  console.log("urlDatabase[shortURL].userID: ")
  console.log(urlDatabase[shortURL].userID);
  if (req.body.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].url = fullURL;
  }
  // Redirect back to the urls index page
  res.redirect("/urls");
});
// POST route to logout and remove the user's cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
// GET route to /register to show registration form
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});
// POST route to /register to show registration form
app.post("/register", (req, res) => {
  console.log("Contents of req.body in POST to /register route: ")
  console.log(req.body);  // debug statement to see POST parameters
  for (let userId in users) {
    if (users.hasOwnProperty(userId)) {
      if (req.body.email === users[userId].email) {
        res.status(400).send({ error: "Email address already in database" });
      }
    }
  }
  if (req.body.email === "") {
    res.status(400).send({ error: "Need an email address" });
  } else if (req.body.password === "") {
    res.status(400).send({ error: "Need a password" });
  } else {
    let newRandomString = generateRandomString();
    users[newRandomString] = {
      id: newRandomString,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10)
    }
    req.session.user_id = newRandomString;
    console.log("users object in POST /register before redirect to /urls: ")
    console.log(users); // debug statement
    res.redirect("/urls");
  };
});
// Our actual URL redirection GET route
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  console.log(longURL);
  // Respond with a redirection to longURL
  res.redirect(longURL);
});

// Persistent listener after all routes have been defined
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// Random string generator to create unique-ish keys for urlDatabase
function generateRandomString() {
  let randomString= "";
  const alphaNums = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    randomString += alphaNums.charAt(Math.floor(Math.random() * alphaNums.length));
  return randomString;
}

// Take the user's id and spit out an object that contains the links they own
function urlsForUser(id) {
  let urlsBelongingToUser = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase.hasOwnProperty(urlID)) {
      //console.log("The userID: " + urlDatabase[urlID].userID);
      //console.log("The id: ");
      //console.log(id);
      if (urlDatabase[urlID].userID === id) {
        urlsBelongingToUser[urlID] = urlDatabase[urlID];
      }
    }
  }
  //console.log("urlsBelongingToUser in own function: ")
  //console.log(urlsBelongingToUser)
  return urlsBelongingToUser;
}