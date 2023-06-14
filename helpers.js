
// fucntion to check if email exists or not
const getUserByEmail = function (email, database) {
  // check if user exists or not
  for (var user_id in database) {
    if (database[user_id]['email'] === email) {
      return database[user_id]
    }
  }
  return null;
};

//export
module.exports = getUserByEmail;