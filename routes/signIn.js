const express = require('express');
const router = express.Router();
const path = require('path');

// Required to read and modfiy the json files
var fs = require("fs");

/*
  "../public/json/users.json" -> got to jump out of the "routes" folder to acess the "public" folder
*/
var dataUsers = require("../public/json/users.json");

// Read and parse the users.json file
fs.readFile("./public/json/users.json", "utf-8", function (err, dataUsers) {
  dataUsers = JSON.parse(dataUsers);
});

// Sign In Page 
router.get("/", (req, res) => {
  var someData = {
    name: "Library Biblioteca Bibliothèque",
  };

  res.render('signIn', {
    data: someData
  });

});

/*
  This function was created to ensure that app.post concerning "/signin" gets 
  triggered if the user has not logged into the system
*/
function isLoggedIn(req, res, next) {

  /*
    Abstract Level - Case 1
      If no one has logged into the system yet then go to the app.post controller with the "/signin" route 
    
      Case 2
        A)If the user logged into the system and then logged out, ensure that the session is destroyed
  */
  if (req.session.userName) {
    if (req.loggedOut) {
      res.redirect("/");
      req.session.destroy();
      console.log("User has logged out.");
      console.log(`Final, destruction of cookie: ${JSON.stringify(req.session)}`);
      console.log("------------------------------------------------------------");
    }
    else {
      // Not sure why it is here - keep it as a safeguard at the moment
      next();
    }
  }
  else {
    next();
  }
}

/*
  1)Used to authenticate user credentials
  2)returns an object containing the status which issues whether the login had been sucessful/invalid
  3)password/not a registered username. It also returns the username if the login had been sucessful
*/
function userAuthentication(req, res) {
  var output;

  // Initalize values to 0
  var userExists = false;

  // Determine the length of the users.json file
  let length = 0;
  for (let key in dataUsers) {
    length++;
  }

  var i = 0;
  var users = Object.keys(dataUsers);
  var userPasswords = Object.values(dataUsers);
  var userIndex;

  // loop used to determine if the user exists within users.json
  while (!userExists && i <= length) {
    if (users[i] === req.body.uname) {
      userExists = true;
      userIndex = i;
    }
    i++;
  }

  // Provide the status of the user's credentials
  if (userExists) {
    if (userPasswords[userIndex] === req.body.password) {
      output = "Success";
    } else {
      output = "Invalid password";
    }
  } else {
    output = "Not a registered username";
  }

  return {
    status: output,
    username: users[userIndex]
  }
};

// Sign In Page - After form submission
router.post("/", isLoggedIn, (req, res) => {
  var someData = {
    name: "Library Biblioteca Bibliothèque",
    status: ""
  };

  // Determine whether the user has sucessfully logged onto the system
  var loginStatus = userAuthentication(req, res);
  switch (loginStatus.status) {
    case "Invalid password":
    case "Not a registered username":
      someData.status = loginStatus.status;
      res.render('signIn', {
        data: someData
      });
      break;
    case "Success":
      someData.userName = loginStatus.username;
      req.session.userName = loginStatus.username;
      req.session.loggedOut = false;
      console.log("------------------------------------------------------------");
      console.log(`Sucessful login, creation of cookie: ${JSON.stringify(req.session)}`);
      res.redirect("/home");
      break;
    default:
      console.log("Error-Switch statement-concerning signIn")
  }
});


module.exports = router;
