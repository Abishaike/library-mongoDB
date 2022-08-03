// On a local machine its port 3000
const HTTP_PORT = process.env.PORT || 3000;

/*
  Import modules
*/
const express = require("express");
const exphbs = require('express-handlebars');
const path = require("path");

/*
  Additional Modules for Assignment 2
  1) express-session is required to generate a session while the user has logged onto the home page
  2) randomstring is required to generate a secret string for the cookie
*/
const session = require("express-session");
const randomStr = require("randomstring");

// Execute the express module
const app = express();

// public folder becomes the default folder
app.use("/", express.static("public"));

app.engine(".hbs", exphbs.engine({
  extname: ".hbs",

  // Ensures that a default layout from the views folder isnt activated 
  defaultLayout: false,

  // Location of the layouts
  layoutsDir: path.join(__dirname, "/views")
}));

// Required to access the handlebars view engine
app.set("view engine", ".hbs");

// Ensures that the incoming response (server back to client) supports a JSON format
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// trust first proxy - required for express session
app.set("trust proxy", 1);

/*
  Generate a random string which will be the value for the cookie, where properties such as 
  username will be embedded
*/
var strRandom = randomStr.generate();


// Generating a session with a cookie
app.use(session({
  secret: strRandom,
  saveUninitialized: true,

  // for every request to the server, a new session will be created
  resave: false,
  cookie: {
    // Session expires after 3 minutes of inactivity.
    expires: 3 * 60 * 1000
  }
}));


// Home Page - This is the root
app.get("/", (req, res) => {

  var someData = {
    name: "Library Biblioteca Bibliothèque",
  };

  res.render('landing', {
    data: someData
  });

});

/*
  Additional Modules for Assignment 3
*/
const signIn = require("./routes/signIn.js");
app.use("/signin", signIn);

const home = require("./routes/home.js");
app.use("/home", home);

const borrow = require("./routes/borrow.js");
app.use("/borrowed", borrow);

const returnB = require("./routes/returnB.js");
app.use("/returned", returnB);


app.get("/signout", (req, res) => {

  // Makes the loggedOut property of the cookie to true
  req.session.loggedOut = true;
  console.log(`User has logged out: ${JSON.stringify(req.session)}`);
  console.log("----------------------------------------------------------");
  var someData = {
    name: "Library Biblioteca Bibliothèque",
  };

  res.render('landing', {
    data: someData
  });

});

const server = app.listen(HTTP_PORT, function () {
  console.log(`Listening on port ${HTTP_PORT}`);
});

