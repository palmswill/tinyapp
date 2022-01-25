const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { acceptsLanguages } = require("express/lib/request");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {

  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;

}

app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
  const randomShortString=generateRandomString();
  urlDatabase[randomShortString]=`http://${req.body.longURL}`;
  console.log(`${randomShortString} : ${req.body.longURL}`);  // Log the POST request body to the console
  res.redirect("/urls")         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] /* What goes here? */ };
  res.redirect(urlDatabase[req.params.shortURL]);
  // res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] /* What goes here? */ };

   res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL/delete",(req,res)=>{
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")

})

app.post("/urls/:shortURL",(req,res)=>{
  urlDatabase[req.params.shortURL]=req.body.longURL;
  res.redirect("/urls")
})

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