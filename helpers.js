
// hashing the password
const bcrypt = require("bcryptjs");

// function to check if email exists or not
const getUserByEmail = function (email, database) {
  // check if user exists or not
  for (var user_id in database) {
    if (database[user_id]['email'] === email) {
      return database[user_id]
    }
  }
  return null;
};

// function to filter user's urls
function urlsForUser (id, database) {
  const newDatabase = {}
  for (var url_id in database) {
    if (database[url_id].userID === id) {
      newDatabase[url_id] = database[url_id];
    }
  }
  return newDatabase;
}

// function to check for empty email and password
function checkEmptyString (email, password) {
  if (email.length === 0) {
    return true;
  }
  if (password.length === 0) {
    return true;
  }

  return false;
}

// function to check if password matches
function checkPasswordMatch (password, hashedPassword) {
  //check password 
  if (bcrypt.compareSync(password, hashedPassword)) {
    return true;
  }
  return null;
}

// function to generate shotURL
function generateRandomString (length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

//export
module.exports = { getUserByEmail, urlsForUser, checkEmptyString, checkPasswordMatch, generateRandomString }; 