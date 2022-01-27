const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.ca", userID: "user2RandomID" },
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
 * create url shortener record in database 
 * @param {*} longURL long url link to convert to short url,
 * @param {*} userID 
 * @return shortUrl
 */
const createUrl = (longURL, userID) => {
  let shortUrl = generateRandomString();
  let url = {
    longURL: longURL,
    userID: userID,
  };
  urlDatabase[shortUrl] = url;
  return shortUrl;
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

module.exports = {createUrl,matchShortUrlwithId, filterUrlDbById, urlDatabase };
