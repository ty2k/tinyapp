"use strict";

const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs")

// Require body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Instead of an actual URL database, use a dummy database object for now
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Instead of an actual user database, use a dummy database object for now
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

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
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  console.log("Contents of req.cookies in GET /urls: ");
  console.log(req.cookies);
  console.log("Contents of user in templateVars in GET /urls: ");
  console.log(templateVars.user);
  console.log("templateVars at GET /urls:")
  console.log(templateVars);
  res.render("urls_index", templateVars);
});
// Create new URL page urls_new at /urls/new
// Put /urls/new ahead of /urls/:id so that "new" isn't treated as a short URL id
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  console.log()
  res.render("urls_new", templateVars);
});
// GET route to urls_show in form urls/:id
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});
// POST route for new URLs being shortened
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let fullURL = req.body.longURL;
  let newRandomString = generateRandomString();
  urlDatabase[newRandomString] = fullURL;
  console.log(urlDatabase);
  // Respond with a redirect to /urls/newRandomString
  res.redirect('/urls/' + newRandomString);
});
// GET route for login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
});
// POST route for logging in and becoming cookied
app.post("/login", (req, res) => {
  // Set a cookie with Express's built in res.cookie
  res.cookie("name", req.body.username);
  console.log("Our user submitted req.body.username: " + req.body.username);
  // After logging in, redirect to /urls
  res.redirect("/urls");
});
// POST route for deleting existing shortened URLs
app.post("/urls/:id/delete", (req, res) => {
  // Delete the URL from our urlDatabase object using its id as the key
  delete urlDatabase[req.params.id];
  // Redirect back to the urls index page
  res.redirect('/urls');
});
// POST route to change an existing shortened URL
app.post("/urls/:id", (req, res) => {
  console.log(req.body); // debug statement to see POST parameters
  let fullURL = req.body.newLongURL;
  let shortURL = req.body.shortURL;
  urlDatabase[shortURL] = fullURL;
  // Redirect back to the urls index page
  res.redirect('/urls');
});
// POST route to logout and remove the user's cookie
app.post("/logout", (req, res) => {
  res.clearCookie("name", req.body.username);
  res.redirect("/urls");
});
// GET route to /register to show registration form
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
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
  if (req.body.email === '') {
    res.status(400).send({ error: "Need an email address" });
  } else if (req.body.password === '') {
    res.status(400).send({ error: "Need a password" });
  } else {
    let newRandomString = generateRandomString();
    users[newRandomString] = {
      id: newRandomString,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie("user_id", newRandomString);
    console.log("users object in POST /register before redirect to /urls: ")
    console.log(users); // debug statement
    res.redirect("/urls");
  };
});
// Our actual URL redirection GET route
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
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