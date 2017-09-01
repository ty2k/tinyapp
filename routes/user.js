const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const getRandomString = require("../utils/random-string").generateRandomString;
const users = require("../db/users");

// GET route for login page
router.get("/login", (req, res) => {
  // If there is already a user logged in, redirect to /urls
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  // Else display the login form
  } else {
    let templateVars = {
      user: users[req.session["user_id"]]
    };
    res.render("login", templateVars);
  }
});

// GET route to /register to show registration form
router.get("/register", (req, res) => {
  // If there is already a user logged in, redirect to /urls
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  // Else display the login form
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("register", templateVars);
  }
});

// POST route to register a new user
router.post("/register", (req, res) => {
  for (let userId in users) {
    if (users.hasOwnProperty(userId)) {
      // If user exists, error
      if (req.body.email === users[userId].email) {
        return res.end("<html><head><title>TinyApp: Error</title></head><body>Email address already in database. <a href='/user/register'>Register</a> or <a href='/user/login'>login</a>.</body></html>\n");
      }
    }
  }
  // If email field is empty, error
  if (req.body.email === "") {
    return res.end("<html><head><title>TinyApp: Error</title></head><body>Missing email address from registration form. <a href='/user/register'>Register</a> or <a href='/user/login'>login</a>.</body></html>\n");
  // If password field is empty, error
  } else if (req.body.password === "") {
    return res.end("<html><head><title>TinyApp: Error</title></head><body>Missing password from registration form. <a href='/user/register'>Register</a> or <a href='/user/login'>login</a>.</body></html>\n");
  // If user doesn't exist yet, email and password are present, create new user
  } else {
    let newRandomString = getRandomString();
    users[newRandomString] = {
      id: newRandomString,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = newRandomString;
    // Redirect to /urls after creating new user and session
    res.redirect("/urls");
  }
});

// POST route for logging in and becoming cookied
router.post("/login", (req, res) => {
  let existingEmails = [];
  let matchedUserId = "";
  // Fill an array with our existing emails
  for (let userId in users) {
    if (users.hasOwnProperty(userId)) {
      existingEmails.push(users[userId].email);
    }
  }
  // If the submitted email is not in the array, error
  if (existingEmails.indexOf(req.body.email) === -1) {
    return res.end("<html><head><title>TinyApp: Error</title></head><body>Invalid username or password. <a href='/user/register'>Register</a> or <a href='/user/login'>login</a>.</body></html>\n");
  // Else if the email is in the array, get the ID associated with it and compare the password hashes
  } else {
    for (let userId in users) {
      if (users.hasOwnProperty(userId)) {
        if (users[userId].email === req.body.email) {
          matchedUserId = userId;
        }
      }
    }
    // Check the matched ID hashed password against the submitted password that we will hash here
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    // If the passwords match, set the user_id cookie and redirect to /urls
    if (bcrypt.compareSync(req.body.password, users[matchedUserId].hashedPassword)) {
      req.session.user_id = matchedUserId;
      return res.redirect("/urls");
    // If the passwords don't match, error
    } else {
      res.end("<html><head><title>TinyApp: Error</title></head><body>Invalid username or password. <a href='/user/register'>Register</a> or <a href='/user/login'>login</a>.</body></html>\n");
    }
  }
});

// POST route to logout and remove the user's cookie
router.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

module.exports = router;
