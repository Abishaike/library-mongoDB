const express = require('express');
const router = express.Router();

//	require MongoDB and create MongoClient object
const MongoClient = require("mongodb").MongoClient;

const uri = "mongodb+srv://abishaike:123456789a@mongodbatlas.wvcskkm.mongodb.net/?retryWrites=true&w=majority";


// Home Page
router.get("/", (req, res) => {

  // async function is used to mimic the code below so that it seems to be synchronous
  async function asyncDBCall() {
    let db, user, booksAvail, books;
    let booksBorrow = [];

    // Establish a connection
    try {
      const client = await MongoClient.connect(uri);
      db = client.db('library');
    } catch (err) {
      console.log(`err = ${err}`);
    }

    //  display all of the books in the system
    try {

      books = await db.collection("books").find({}).toArray();
    } catch (err) {
      console.log(`err = ${err}`);
    }

    //  display all of the available books
    try {

      booksAvail = await db.collection("books").find({ available: true }).toArray();
    } catch (err) {
      console.log(`err = ${err}`);
    }

    //  display all of the borrowed books
    try {
      user = await db.collection("clients").findOne({ username: req.session.userName });
      var i, document;

      /*
        Loop through all of the books and extract all of the books the user has borrowed
        based off the info from the "clients" collection
      */
      books.forEach(element => {
        for (i = 0; i < user.IDBooksBorrowed.length; i++) {
          if (element.id == user.IDBooksBorrowed[i]) {
            document = {
              id: element.id,
              title: element.title,
              author: element.author,
              available: element.available
            };
            booksBorrow.push(document);
          }
        }

      });
    } catch (err) {
      console.log(`err = ${err}`);
    }

    // Populate the "home" page
    var someData = {
      name: "Library Biblioteca Bibliothèque",
      userName: req.session.userName,
      availBooks: booksAvail,
      borrowedBooks: booksBorrow
    };


    res.render('home', {
      data: someData
    });

    db.close();
  }

  asyncDBCall();
});

/*
  isActive function is used to redirect the webpage back to the landing page if the
  user had logged out, went back to the home page to modify its contents

  It is also used to redirect the user to the sign in page if the session has expired

  It is also used to execute the app.post controller in regards to the "/home" route if the conditions
  above fail
*/

function isActive(req, res, next) {
  if (req.session.loggedOut) {
    /*
      res.redirect("../") --> redirect back to the landing page
      res.redirect("/") --> wont work because it means "/home" for this case
    */
    res.redirect("../");
    req.session.destroy();
    console.log("------------------------------------------------------------");
    console.log("The user signed out, returned to the home page, and tried to borrow/return a book/books");
    console.log("This action had been prevented due to the loggedOut property being true");
    console.log("The current session will now terminate.");
    console.log(`Final, destruction of cookie: ${JSON.stringify(req.session)}`);
    console.log("------------------------------------------------------------");
  }
  else if (req.session.cookie.expires == req.session.cookie.originalMaxAge) {
    res.redirect("/signin");
    console.log("------------------------------------------------------------");
    console.log("Cookie has expired, redirected to the sign in page.");
    console.log("------------------------------------------------------------");
  }
  else {
    if (req.session.loggedOut == undefined) {
      console.log("------------------------------------------------------------");
      console.log("The user continously tries to select an option after he/she logged out");
      console.log("Continously being redirected to the landing page");
      console.log("------------------------------------------------------------");
      res.redirect("../");
    }
    else {
      next();
    }
  }
}

// Home Page - Gets triggered when the borrow button is clicked
// Gets triggered after the form submission which is present on the home page
router.post("/", isActive, (req, res, next) => {
  if (req.body.bkCheckBoxAvail) {
    // --------------------------------------------------------------------------------
    /*
      Determine the number of selected books from the borrow section if one book has been selected then req.body.bkCheckBoxAvail is an object and not an array
    */
    var borrowBtn;
    if (req.body.bkCheckBoxAvail) {
      borrowBtn = true;
      var numSelectedBooks;
      if (Array.isArray(req.body.bkCheckBoxAvail)) {
        numSelectedBooks = req.body.bkCheckBoxAvail.length;
      } else {
        numSelectedBooks = 1;
      }
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    /*
      Extract all of the books that have been selected
    */
    let i;
    let selectBooks = [];
    if (numSelectedBooks > 1) {
      for (i = 0; i < numSelectedBooks; i++) {
        selectBooks.push(req.body.bkCheckBoxAvail[i]);
      }
    }
    else {
      selectBooks.push(req.body.bkCheckBoxAvail);
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    /*
      Send the data to "/borrowed"
    */
    req.session.selectBooks = selectBooks;
    res.redirect("/borrowed");
    // --------------------------------------------------------------------------------
  }
  else {
    // --------------------------------------------------------------------------------
    /*
      Determine the number of selected books from the return section if one book has been selected then req.body.bkCheckBoxNotAvail is an object and not an array
    */
    var returnBtn;
    if (req.body.bkCheckBoxNotAvail) {
      returnBtn = true;
      var numSelectedBooks;
      if (Array.isArray(req.body.bkCheckBoxNotAvail)) {
        numSelectedBooks = req.body.bkCheckBoxNotAvail.length;
      } else {
        numSelectedBooks = 1;
      }
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    /*
      Extract all of the books that have been selected
    */
    let i;
    let selectBooks = [];
    if (numSelectedBooks > 1) {
      for (i = 0; i < numSelectedBooks; i++) {
        selectBooks.push(req.body.bkCheckBoxNotAvail[i]);
      }
    }
    else {
      selectBooks.push(req.body.bkCheckBoxNotAvail);
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    /*
      Send the data to "/returned"
    */
    req.session.selectBooks = selectBooks;
    res.redirect("/returned");
    // --------------------------------------------------------------------------------
  }

});

module.exports = router;

