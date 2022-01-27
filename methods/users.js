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


const getUserFromCookies =(req,res,next)=>{
  req.user_id=req.session.user_id;
  next();
}

const setUserIdToCookies=(req,userId)=>{
  req.session.user_id=userId;

}

const removeUserFromCookies=(req)=>{
  req.session.user_id=null;
}


/**
 * check if user exists in the user object;
 * @param {*} email email to match
 * @returns number of value that matches the email in the users object;
 */
const userExist = (email) => {
  return Object.values(users).filter((user) => email === user.email).length;
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
  Object.values(users).forEach((user)=>{
    if (user.email === email && 
      bcrypt.compareSync(password, user.password)){
        userId = user.id;
      }
  })
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

module.exports = { users, authenticateUser, createUser,getUserFromCookies,setUserIdToCookies,removeUserFromCookies };
