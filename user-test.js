const users = {
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
}

for (let userId in users) {
  if (users.hasOwnProperty(userId)) {
    console.log(userId + " -> " + users[userId].email);
  }
}