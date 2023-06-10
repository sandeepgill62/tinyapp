const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

// set up for ejs template
app.set("view engine", "ejs");

// to translate and parse the data
app.use(express.urlencoded({ extended: true }));

// to use cookieParser
app.use(cookieParser());

// database to store URLs key-value
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

users["hhhhhh"] = { user_id: "hhhhhh", email: "hello111111@com", password: "11111" };
users["hhhhh1"] = { user_id: "hhhhh1", email: "hello111@com", password: "11111" };


// POST route to edit the long URL
app.post("/urls/:id", (req, res) => {
  //get id and newURL value into variable
  const id = req.params.id;
  const newURL = req.body.longURL;
  //update new long URL using id
  urlDatabase[id] = newURL;

  // redirect to url_index page. -> remember use /urls
  res.redirect("/urls");
});

// POST route to delete the URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  // delete url from database
  delete urlDatabase[id];
  // redirect to url_index page using /urls. -> remember use /
  res.redirect("/urls");
});

// GET route to show form
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]]
  };

  //console.log(templateVars);

  res.render("urls_index", templateVars);
});

// POST route to add new URL 
app.post("/urls", (req, res) => {
  // create shortURL
  const shortURL = generateRandomString(6);
  // added new URl into database
  urlDatabase[shortURL] = req.body.longURL;

  //redirect to brower
  res.redirect(`urls/${shortURL}`);
});

// GET route for new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// Route Parameters
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

// GET route for shorter version to redirect to actual long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  // redirect to actual website url
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  // get username value in req.body
  const username = req.body.username;
  // set up cookie
  res.cookie('username', username);
  // redirect to url_index page using /urls. -> remember use /urls
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // clear the cookie
  res.clearCookie('username');
  res.clearCookie('user_id');
  // redirect to url_index page using /urls. -> remember use /urls
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]]
  };

  //console.log("==> " + templateVars.user);
  // render register
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  // create user_id
  const user_id = generateRandomString(6);
  //get email and password value
  const email = req.body.email;
  const password = req.body.password;

  // call function to check empty string input
  if (checkEmptyString(email, password)) {
    res.status(400).send("Email and password can not be empty");
    return;
  }

  // call function to check existing user
  if (checkExistingUser(email)) {
    res.status(400).send("Email is already in the users");
    return;
  }

  //add new user into users
  users[user_id] = { user_id, email, password };

  //set up cookie with user id
  res.cookie('user_id', user_id);

  console.log(users);
  res.redirect("/urls");
});

// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: "Hello World!" };
//   res.render("hello_world", templateVars);
// });

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// function to check empty email and password
function checkEmptyString (email, password) {
  if (email.length == 0 && password.length == 0) {
    return true;
  }
  return false;
}

// function to check existing user
function checkExistingUser (email) {

  // check if user already exists or not
  for (var user_id in users) {
    if (users[user_id]['email'] === email) {
      return users[user_id]
    }
  }
  return null;
}

// function to generate shotURL
function generateRandomString (length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}