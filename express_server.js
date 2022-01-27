const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { acceptsLanguages } = require("express/lib/request");
const cookieParser = require("cookie-parser");

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.ca", userID: "user2RandomID" },
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

const error = {
  siginError: "You are not Logged In, Please register or Sign in",
  credentialError: "Invalid credential",
  notBelongError:
    "This link does not belong to you! Where did you get it from?",
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
const matchedUser = (email, password) => {
  return Object.values(users).filter(
    (user) => user.email === email && user.password === password
  );
};
/**
 *  return filetered urldb by user Id input
 * @param {*} Id user Id
 * @returns filtered db;
 */
const filterUrlDbById = (Id) => {
  let filteredDb = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === Id) {
      filteredDb[url] = urlDatabase[url];
    }
  }
  return filteredDb;
};

/**
 * return if the shortUrl belong to the user
 * @param {} shortUrl
 * @param {*} id userID
 * @returns true if it belongs to the user, false if it doesnt, or if the shortURL doesnt exist
 */
const matchShortUrlwithId = (shortUrl, id) => {
  if (urlDatabase[shortUrl]) {
    return urlDatabase[shortUrl].userID === id;
  }
  return false;
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  // res.send("Hello!");
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login", { user: users[req.cookies["user_id"]] });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let foundUser = matchedUser(email, password);

  if (foundUser.length) {
    res.cookie("user_id", foundUser[0].id);
    res.redirect("/urls");
  } else {
    res.render("error",{errorMessage:"invalid email or password",user:undefined})
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
    res.render("error",{errorMessage:"either email or password is empty or already taken",user:undefined})
  } else {
    users[randomID] = { id: randomID, email, password };
    res.cookie("user_id", randomID);
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (user_id) {
    const filteredDatabase = filterUrlDbById(user_id);
    const templateVars = {
      urls: filteredDatabase,
      user: users[user_id],
    };
    res.render("urls_index", templateVars);
  } else {
    res.render("error", {
      errorMessage: error.siginError,
      user: undefined,
    });
  }
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const randomShortString = generateRandomString();
    urlDatabase[randomShortString] = {
      longURL: `https://${req.body.longURL}`,
      userID: req.cookies["user_id"],
    };
    res.redirect("/urls");
  } else {
    res.render("error", {
      errorMessage: error.siginError,
      user: undefined,
    });
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    res.render("urls_new", { user: users[req.cookies["user_id"]] });
  } else {
    res.render("error", {
      errorMessage: error.siginError,
      user: undefined,
    });
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies["user_id"];
  if (matchShortUrlwithId(req.params.shortURL, user_id)) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[user_id],
    };

    res.render("urls_show", templateVars);
  } else if (!user_id) {
    res.render("error", {
      errorMessage: error.siginError,
      user: undefined,
    });
  } else if (!matchShortUrlwithId(req.params.shortURL, user_id)) {
    res.render("error", {
      errorMessage: error.notBelongError,
      user: users[user_id],
    });
  }
});
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.render("error", {
      errorMessage: error.credentialError,
      user: undefined,
    });
  }
});

app.post("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies["user_id"];
  console.log("1");
  if (urlDatabase[req.params.shortURL].userID === user_id) {
    console.log("2");
    urlDatabase[req.params.shortURL] = {
      longURL: `https://${req.body.longURL}`,
      userID: user_id,
    };
    res.redirect("/urls");
  } else if (!user_id) {
    res.render("error", {
      errorMessage: error.siginError,
      user: undefined,
    });
  } else {
    res.render("error", {
      errorMessage: error.notBelongError,
      user: users[user_id],
    });
  }
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
