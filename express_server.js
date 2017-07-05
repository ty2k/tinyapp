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

// Instead of an actual database, use a dummy database object for now
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
// Create new URL page urls_new at /urls/new
// Put /urls/new ahead of /urls/:id so that "new" isn't treated as a short URL id
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// GET route to urls_show in form urls/:id
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id]
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