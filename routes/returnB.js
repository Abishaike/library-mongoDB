const express = require('express');
const router = express.Router();

//	require MongoDB and create MongoClient object
const MongoClient = require("mongodb").MongoClient;

const uri = "mongodb+srv://abishaike:123456789a@mongodbatlas.wvcskkm.mongodb.net/?retryWrites=true&w=majority";

// Home Page - Gets triggered when the return button is clicked
// Gets triggered after the form submission which is present on the home page
router.get("/", (req, res) => {
  // async function is used to mimic the code below so that it seems to be synchronous
  async function asyncDBCall() {

    // ---------------------------------------------------------------------
    /*
      Getting the selected books from "app.post" in relation to the "/home" route
    */
    let selectBooks;
    selectBooks = req.session.selectBooks;
    // ---------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    /*
      Initialization of variable which will be used later on within this function
    */
    let ii, db, user, booksAvail, booksNotAvail, books;
    let userBorrowed;
    let booksBorrow = [];
    let selectBooksIDs = [];
    let borrowArray = [];
    let updateBorrowArray = [];
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    // Establish a connection
    try {
      const client = await MongoClient.connect(uri);
      db = client.db('library');
    } catch (err) {
      console.log(`err = ${err}`);
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    /*
    Extract all of the books in the system
    */
    try {
      books = await db.collection("books").find({}).toArray();
    } catch (err) {
      console.log(`err = ${err}`);
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    /*
      Place the IDs of the the selected books into an array called "selectBooksIDs"
    */
    for (i = 0; i < selectBooks.length; i++) {
      for (ii = 0; ii < books.length; ii++) {
        if (selectBooks[i] == books[ii].title) {
          selectBooksIDs.push(books[ii].id);
        }
      }
    }
    // --------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------
    /*
      Extract the client document and create the newly updated ID borrowed record
    */
    try {
      user = await db.collection("clients").findOne({ username: req.session.userName });
      for (i = 0; i < user.IDBooksBorrowed.length; i++) {
        borrowArray.push(user.IDBooksBorrowed[i]);
      }

      for (i = 0; i < selectBooksIDs.length; i++) {
        for (ii = 0; ii < borrowArray.length; ii++) {
          if (selectBooksIDs[i] == borrowArray[ii]) {
            borrowArray[ii] = -1;
          }
        }
      }

      updateBorrowArray = borrowArray.filter(function (e) {
        if (e != -1) {
          return e;
        }
      });


    } catch (err) {
      console.log(`err = ${err}`);
    }
    // ------------------------------------------------------------------

    // -----------------------------------------------------------------------------
    /*
      Extract the client document and update it with the newly updated ID borrowed record
    */
    try {
      user = await db.collection("clients").findOneAndUpdate
        ({ username: req.session.userName }, { $set: { IDBooksBorrowed: updateBorrowArray } });
    } catch (err) {
      console.log(`err = ${err}`);
    }
    // ------------------------------------------------------------------

    // ------------------------------------------------------------------
    /*
        Update all of the "returned books" to "available: true" within the "books" collection
    */
    try {
      for (i = 0; i < selectBooks.length; i++) {
        userBorrowed = await db.collection("books").findOneAndUpdate
          ({ title: selectBooks[i] }, { $set: { available: true } });
      }
    } catch (err) {
      console.log(`err = ${err}`);
    }
    // ------------------------------------------------------------------

    // ------------------------------------------------------------------
    /*
       Extract all of the available books
    */
    try {
      booksAvail = await db.collection("books").find({ available: true }).toArray();
    } catch (err) {
      console.log(`err = ${err}`);
    }
    // ------------------------------------------------------------------

    // ------------------------------------------------------------------
    /*
    display all of the borrowed books
    */
    try {
      user = await db.collection("clients").findOne({ username: req.session.userName });

      let document;

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
    // ------------------------------------------------------------------

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

module.exports = router;