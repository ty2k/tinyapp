///////////////////////////////////////
//  Express server and requirements
///////////////////////////////////////

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
let cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: [ "anexamplekey", "anotherexamplekey" ],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

///////////////////////////////////////
//  URL and User database objects
///////////////////////////////////////

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
    hashedPassword: "$2a$10$.h4h.MdXZ1dvfD1irSpW/eBFnw7W8zJ.hnwuRESc/CEl0f7N3drva"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "$2a$10$RJtBCOtiQCZ4Mdh127m9GuRJkpnLs9Em6khLeBRuFDWPWbyUjFarS"
  }
};

///////////////////////////////////////
//  Functions
///////////////////////////////////////

// Using the user's id, create an object of links they have made
function urlsForUser(id) {
  let urlsBelongingToUser = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase.hasOwnProperty(urlID)) {
      if (urlDatabase[urlID].userID === id) {
        urlsBelongingToUser[urlID] = urlDatabase[urlID];
      }
    }
  }
  return urlsBelongingToUser;
}

// Random string generator to create unique-ish keys for users and URLs
function generateRandomString() {
  let randomString = "";
  const alphaNums = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomString += alphaNums.charAt(Math.floor(Math.random() * alphaNums.length));
  }
  return randomString;
}

///////////////////////////////////////
//  Routes - GET
///////////////////////////////////////

app.get("/", (req, res) => {
  // If user is not authenticated, redirect to /login
  if (!req.session.user_id) {
    return res.redirect("/login");
  // Else go to the index of shortened URLs
  } else {
    res.redirect("/urls");
  }
});
// Show urls_index at /urls
app.get("/urls", (req, res) => {
  // Create an empty urls object to pass to non-authenticated users
  let urlsToDisplay = {};
  // If a user is authenticated, show them the urls they have created
  if (req.session.user_id) {
    urlsToDisplay = urlsForUser(req.session.user_id);
  }
  let templateVars = {
    urls: urlsToDisplay,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});
// Create new URL page urls_new at /urls/new
// Put /urls/new ahead of /urls/:id so that "new" isn't treated as a short URL id
app.get("/urls/new", (req, res) => {
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
app.get("/urls/:id", (req, res) => {
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
// GET route for login page
app.get("/login", (req, res) => {
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
app.get("/register", (req, res) => {
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
// GET route for redirection out
app.get("/u/:shortURL", (req, res) => {
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

///////////////////////////////////////
//  Routes - POST
///////////////////////////////////////

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
  // If the submitted email is not in the array, error
  if (existingEmails.indexOf(req.body.email) === -1) {
    return res.end("<html><head><title>TinyApp: Error</title></head><body>Invalid username or password. <a href='/register'>Register</a> or <a href='/login'>login</a>.</body></html>\n");
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
      res.end("<html><head><title>TinyApp: Error</title></head><body>Invalid username or password. <a href='/register'>Register</a> or <a href='/login'>login</a>.</body></html>\n");
    }
  }
});
// POST route to /register to attempt creation of new user
app.post("/register", (req, res) => {
  for (let userId in users) {
    if (users.hasOwnProperty(userId)) {
      // If user exists, error
      if (req.body.email === users[userId].email) {
        return res.end("<html><head><title>TinyApp: Error</title></head><body>Email address already in database. <a href='/register'>Register</a> or <a href='/login'>login</a>.</body></html>\n");
      }
    }
  }
  // If email field is empty, error
  if (req.body.email === "") {
    return res.end("<html><head><title>TinyApp: Error</title></head><body>Missing email address from registration form. <a href='/register'>Register</a> or <a href='/login'>login</a>.</body></html>\n");
  // If password field is empty, error
  } else if (req.body.password === "") {
    return res.end("<html><head><title>TinyApp: Error</title></head><body>Missing password from registration form. <a href='/register'>Register</a> or <a href='/login'>login</a>.</body></html>\n");
  // If user doesn't exist yet, email and password are present, create new user
  } else {
    let newRandomString = generateRandomString();
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
// POST route for new URLs being shortened
app.post("/urls", (req, res) => {
  // If our user is authenticated, let me make a new short URL
  if (req.session["user_id"]) {
    let newRandomString = generateRandomString();
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
app.post("/urls/:id", (req, res) => {
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
app.post("/urls/:id/delete", (req, res) => {
  // If user is authenticated and created the link, delete URL and return to /urls
  if (urlDatabase[req.params.id].userID === users[req.session["user_id"]].id) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  // Else, error
  } else {
    res.end("<html><head><title>TinyApp: Error</title></head><body>I'm not sure what you're doing here, but please stop trying to delete things you don't own! Please <a href='/register'>register</a> or <a href='/login'>login</a>.</body></html>\n");
  }
});
// POST route to logout and remove the user's cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

///////////////////////////////////////
//  Persistent listener
///////////////////////////////////////

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});