const { assert } = require('chai');
const bcrypt = require("bcryptjs");

const { getUserByEmail, urlsForUser, checkEmptyString, checkPasswordMatch } = require('../helpers.js');

const testUsers = {
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
};

const urlDatabase = {
  'shortURL1': {
    longURL: "longURL1",
    userID: "userRandomID1",
  },
  'shortURL2': {
    longURL: "longURL2",
    userID: "userRandomID2",
  },
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user['id'], expectedUserID);
  });

  it('should return undefined if there is non-existent', function () {
    const user = getUserByEmail("non_existent@example.com", testUsers);
    const expectedUserID = null;
    assert.deepEqual(user, expectedUserID);
  });
});

describe('urlsForUser', function () {
  it('should return a urls for user', function () {
    const newDatabase = urlsForUser("userRandomID1", urlDatabase);
    const expectedNewDatabase = { shortURL1: { longURL: 'longURL1', userID: 'userRandomID1' } };
    assert.deepEqual(newDatabase, expectedNewDatabase);
  });
});

describe('checkEmptyString', function () {

  it('should return true if only email is empty', function () {
    const result = checkEmptyString("", "12345");
    const expectedResult = true;
    assert.deepEqual(result, expectedResult);
  });

  it('should return true if only password is empty', function () {
    const result = checkEmptyString("user@gmail.com", "");
    const expectedResult = true;
    assert.deepEqual(result, expectedResult);
  });

  it('should return true if both email and password are empty', function () {
    const result = checkEmptyString("", "");
    const expectedResult = true;
    assert.deepEqual(result, expectedResult);
  });

  it('should return false if email or password is not empty', function () {
    const result = checkEmptyString("user@gmail.com", "12345");
    const expectedResult = false;
    assert.deepEqual(result, expectedResult);
  });
});

describe('checkPasswordMatch', function () {

  it('should return true if password matches', function () {
    const hashedPassword = bcrypt.hashSync("12345", 10);
    const result = checkPasswordMatch("12345", hashedPassword);
    const expectedResult = true;
    assert.deepEqual(result, expectedResult);
  });
});