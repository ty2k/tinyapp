const urlDatabase = require("../db/urls");

module.exports = {
  // Using the user's id, create an object of links they have made
  urlsForUser: function(id) {
    let urlsBelongingToUser = {};
    for (let urlID in urlDatabase) {
      if (urlDatabase.hasOwnProperty(urlID)) {
        if (urlDatabase[urlID].userID === id) {
          urlsBelongingToUser[urlID] = urlDatabase[urlID];
        }
      }
    }
    return urlsBelongingToUser;
  }
};
