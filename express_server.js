const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { acceptsLanguages } = require("express/lib/request");
const cookieSession = require("cookie-session");

// user methods
const { users, authenticateUser, createUser, getUserFromCookies, setUserIdToCookies,removeUserFromCookies } =
  require("./methods/users");
const {
  matchShortUrlwithId,
  filterUrlDbById,
  urlDatabase,
  createUrl,
} = require("./methods/urls");

// bycrpt
const bcrypt = require("bcryptjs");

// error messages for error page;
const error = {
  siginError: "You are not Logged In, Please register or Sign in",
  credentialError: "Invalid credential",
  notBelongError:
    "This link does not belong to you! Where did you get it from?",
};

app.use(bodyParser.urlencoded({ extended: true }));

// cookiesession
app.use(cookieSession({
  name: 'session',
  keys: ["12345"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// setting session to req.user_id;
app.use(getUserFromCookies);

app.set("view engine", "ejs");

// redirect to urls
app.get("/", (req, res) => {
  // res.send("Hello!");
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user_id = req.user_id;

  res.render("login", { user: users[user_id] });
});

// login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // get id 
  let authenticatedId = authenticateUser(email, password);
  // if there is id , set id to session;
  if (authenticatedId) {
    setUserIdToCookies(req,authenticatedId);
    res.redirect("/urls");
  } else {
    res.render("error", {
      errorMessage: "invalid email or password",
      user: undefined,
    });
  }
});

// logout
app.post("/logout", (req, res) => {
  // remove id from session;
  removeUserFromCookies(req);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user_id = req.user_id;
  res.render("registration", { user: users[user_id] });
});

// create account
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  let userId = createUser(email, password);
  if (userId) {
    setUserIdToCookies(req,userId);
    res.redirect("/urls");
  } else {
    res.render("error", {
      errorMessage: "either email or password is empty or already taken",
      user: undefined,
    });
  }
});

// interface for list of urls
app.get("/urls", (req, res) => {
  const user_id=req.user_id;
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

// create shortenUrl
app.post("/urls", (req, res) => {
  const user_id = req.user_id;
  // user logged in, continue to create short url
  if (user_id ) {
    createUrl(req.body.longURL,user_id);
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
  const user_id = req.user_id;

  if (user_id) {
    res.render("urls_new", { user: users[user_id] });
  } else {
    res.render("error", {
      errorMessage: error.siginError,
      user: undefined,
    });
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.user_id;
  // if url belongs to id, show
  if (matchShortUrlwithId(req.params.shortURL, user_id)) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[user_id],
    };

    res.render("urls_show", templateVars);
    // if not logged in, show login error
  } else if (!user_id) {
    res.render("error", {
      errorMessage: error.siginError,
      user: undefined,
    });
    // if logged in , show wrong id error
  } else if (!matchShortUrlwithId(req.params.shortURL, user_id)) {
    res.render("error", {
      errorMessage: error.notBelongError,
      user: users[user_id],
    });
  }
});
// delete short url
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.user_id;

  // only delete if it matches user id
  if (urlDatabase[req.params.shortURL].userID === user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.render("error", {
      errorMessage: error.credentialError,
      user: undefined,
    });
  }
});

// create url
app.post("/urls/:shortURL", (req, res) => {
  const user_id = req.user_id;
  // only create if user_id match the id
  if (urlDatabase[req.params.shortURL].userID === user_id) {
    createUrl(longURL,user_id);
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
