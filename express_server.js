const express = require("express");
var cookieSession = require('cookie-session');
//const { getUserByEmail } = require("./helpers");
const { getUserByEmail, urlsForUser, checkEmptyString, checkPasswordMatch, generateRandomString } = require("./helpers")

// hashing the password
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

// set up for ejs template
app.set("view engine", "ejs");

// to translate and parse the data
app.use(express.urlencoded({ extended: true }));

// to use cookieSession
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse', 'lab', 'to', 'learn', 'web', 'development'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {
  'b6UTxQ': {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  'i3BoGr': {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {};

// POST endpoint to edit the long URL
app.post("/urls/:id", (req, res) => {
  //get id and newURL value into variable
  const id = req.params.id;
  const newURL = req.body.longURL;
  //update new long URL using id
  urlDatabase[id].longURL = newURL;

  // redirect to url_index page. -> remember use /urls
  res.redirect("/urls");
});

// POST endpoint to delete the URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;

  if (!user_id) {
    res.status(400).send("User is not logged in");
    return;
  }

  if (!urlsForUser(user_id, urlDatabase)[id]) {
    res.status(400).send("ID is not in the database");
    return;
  }

  if (urlDatabase[id].userID !== user_id) {
    res.status(400).send("This URL does not belong to this user");
    return;
  }

  // delete url from database
  delete urlDatabase[id];
  // redirect to url_index page using /urls. -> remember use /
  res.redirect("/urls");
});

// GET endpoint to show form
app.get("/urls", (req, res) => {

  const user_id = req.session.user_id;
  const templateVars = {
    //call function to get user's urls only
    urls: urlsForUser(user_id, urlDatabase),
    user: users[user_id]
  };

  // redirect login if user is not logged in
  if (!templateVars['user']) {
    // redirect login
    res.redirect("login");
    return;
  }

  res.render("urls_index", templateVars);
});

// POST endpoint to add new URL 
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  // create shortURL
  const shortURL = generateRandomString(6);
  // added new URl into database
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user_id };

  //redirect to brower
  res.redirect(`urls/${shortURL}`);
});

// GET endpoint for new URL
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    user: users[user_id]
  };

  // redirect login if user is not logged in
  if (!templateVars['user']) {
    // redirect login
    res.render("login", templateVars);
    return;
  }
  res.render("urls_new", templateVars);
});

// Route Parameters
app.get("/urls/:id", (req, res) => {

  const user_id = req.session.user_id;
  const templateVars = {
    id: req.params.id,
    urls: urlsForUser(user_id),
    user: users[user_id]
  };

  if (!templateVars['user']) {
    res.status(400).send("User is not logged in");
    return;
  }

  if (!urlsForUser(user_id, urlDatabase)[req.params.id]) {
    res.status(400).send("ID is not in the database");
    return;
  }

  if (urlDatabase[req.params.id].userID !== user_id) {
    res.status(400).send("This URL does not belong to this user");
    return;
  }

  templateVars['longURL'] = urlDatabase[req.params.id].longURL;

  res.render("urls_show", templateVars);
});

// GET endpoint for shorter version to redirect to actual long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  // redirect to actual website url
  res.redirect(longURL);
});

// GET endpoint to use login link
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };

  // render login
  res.render("login", templateVars);
});

// POST endpoint to login the user
app.post("/login", (req, res) => {
  //get email and password value
  const email = req.body.email;
  const password = req.body.password;

  // call function to check empty string input
  if (checkEmptyString(email, password)) {
    res.status(400).send("Email and password can not be empty");
    return;
  }

  // call function to check if email found
  const userLogin = getUserByEmail(email, users);

  if (userLogin) {
    const hashedPassword = userLogin['password'];

    // call function to check if password found
    if (!checkPasswordMatch(password, hashedPassword)) {
      res.status(400).send("Password does not match");
      return;
    }
  } else {
    res.status(400).send("E-mail cannot be found");
    return;
  }

  const user_id = userLogin['user_id'];
  // set up cookie with user id
  req.session.user_id = user_id;
  // redirect to url_index page using /urls. -> remember use /urls
  res.redirect("/urls");
});

// POST endpoint to logout the user
app.post("/logout", (req, res) => {
  // clear the cookie
  req.session = null;

  // redirect to login page
  res.redirect("login");
});

// GET endpoint to use register link
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };

  // render register
  res.render("register", templateVars);
});

// POST endpoint to register the user
app.post("/register", (req, res) => {

  // create user_id
  const user_id = generateRandomString(6);
  //get email and password value
  const email = req.body.email;
  const _password = req.body.password;

  // call function to check empty string input
  if (checkEmptyString(email, _password)) {
    res.status(400).send("Email and password can not be empty");
    return;
  }

  // call function to check existing user
  if (getUserByEmail(email, users)) {
    res.status(400).send("Email is already in the users");
    return;
  }

  // convert the password using hashing
  const password = bcrypt.hashSync(_password, 10);

  // add new user into users
  users[user_id] = { user_id, email, password };
  // set up cookie with user id
  req.session.user_id = user_id;
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

// listen the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});