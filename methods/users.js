// bycrpt
const bcrypt = require("bcryptjs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

function generateRandomString() {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * middleware to put session user_id to req.user_id;
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const getUserFromCookies = (req, res, next) => {
  req.user_id = req.session.user_id;
  console.log(req.user_id);
  next();
};

/**
 * set usrId to req.user_id
 * @param {*} req 
 * @param {*} userId 
 */
const setUserIdToCookies = (req, userId) => {
  req.session.user_id = userId;
};

/**
 * remove user_id from session
 * @param {*} req 
 */
const removeUserFromCookies = (req) => {
  req.session.user_id = null;
};

/**
 * get user by email (for helper function session)
 * @param {*} email
 * @param {*} database
 * @returns user object
 */
const getUserByEmail = function (email, database) {
  // lookup magic...
  const userList = Object.values(database).filter(
    (user) => email === user.email
  );
  const user = userList.length ? userList[0] : false;
  return user;
};

/**
 * check if user exists with email in the user object;
 * @param {*} email email to match
 * @returns number of value that matches the email in the users object;
 */
const userExist = (email, db) => {
  const targetDb = db ? db : users;
  return Object.values(targetDb).filter((user) => email === user.email).length;
};

/**
 * return a list of matched users if any user matches both email and password in the users object;
 *
 * @param {*} email email to match
 * @param {*} password password to match
 * @returns return userId if one of user has matching email and password, else return false;
 */
const authenticateUser = (email, password) => {
  let userId;
  Object.values(users).forEach((user) => {
    if (user.email === email && bcrypt.compareSync(password, user.password)) {
      userId = user.id;
    }
  });
  return userId || false;
};

/**
 * create user with random id and provided info if it does not exist in the users object
 * @param email
 * @param password
 * @return return userId if sucessfully created user, false if failed(meaning it exists in users object) or email/password is empty
 */
const createUser = (email, password) => {
  // return false email or password is empty
  if (!(email || password)) return false;
  if (userExist(email)) return false;
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  let user = {
    id: userId,
    email: email,
    password: hashedPassword,
  };
  users[userId] = user;
  return userId;
};

module.exports = {
  users,
  userExist,
  authenticateUser,
  createUser,
  getUserFromCookies,
  setUserIdToCookies,
  removeUserFromCookies,
  getUserByEmail
};
