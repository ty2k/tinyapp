module.exports = {
  // Random string generator to create unique-ish keys for users and URLs
  generateRandomString: function() {
    let randomString = "";
    const alphaNums = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 6; i++) {
      randomString += alphaNums.charAt(Math.floor(Math.random() * alphaNums.length));
    }
    return randomString;
  }
};
