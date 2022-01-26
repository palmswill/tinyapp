const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { acceptsLanguages } = require("express/lib/request");
const cookieParser = require("cookie-parser");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
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
 * @returns list of matched users;
 */
const matchedUser=(email,password)=>{
  return Object.values(users).filter((user)=>user.email === email && user.password === password);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  // res.send("Hello!");
  res.redirect("/urls");
});

app.get("/login",(req,res)=>{
  res.render("login",{user: users[req.cookies["user_id"]] })
})

app.post("/login", (req, res) => {
  const {email,password}=req.body;
  let foundUser=matchedUser(email,password);

  if (foundUser.length){
    res.cookie("user_id",foundUser[0].id);
    res.redirect("/urls");
  }
  else{
    res.status(403).send("invalid username or password");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("registration", { user: users[req.cookies["user_id"]] });
});



app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const { email, password } = req.body;
  if (!email.length || !password.length || userExist(email)) {
    res.status(400).send("either email or password is empty or already taken");
  } else {
    users[randomID] = { id: randomID, email, password };
    res.cookie("user_id", randomID);
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomShortString = generateRandomString();
  urlDatabase[randomShortString] = `https://${req.body.longURL}`;
  res.redirect("/urls"); 
});

app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL])
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { user: users[req.cookies["user_id"]] });
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]] ,
  };

  res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = `https://${req.body.longURL}`;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
