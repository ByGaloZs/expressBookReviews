// Public routes for browsing books and registering users.
// This router exposes endpoints used by unauthenticated clients.
const express = require('express');
let books = require("./booksdb.js");
// `isValid` and `users` are shared with the auth_users module so registration updates the same list.
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// POST /register
// - Registers a new user by pushing `{ username, password }` into the shared `users` array.
// - Validation: requires both `username` and `password`, and username must not already exist.
// Note: This sample stores passwords in plain text for simplicity (do not do this in production).
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered." });
});


// GET /
// - Returns the full `books` object (pretty-printed JSON).
// - `books` is an in-memory map loaded from `booksdb.js` keyed by ISBN.
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// GET /isbn/:isbn
// - Returns the book object for a given ISBN if present.
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found"});
  }
});
  
// GET /author/:author
// - Finds books by exact author match and returns an array of matching book objects.
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const result = Object.keys(books).filter(key => books[key].author === author).map(key => books[key]);
  return res.status(200).send(JSON.stringify(result, null, 4));
});

// GET /title/:title
// - Finds books by exact title match. Returns 404 when no matches.
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const result = Object.keys(books).filter(key => books[key].title === title).map(key => books[key]);

    if (result.length > 0) {
        return res.status(200).send(JSON.stringify(result, null, 4));
    } else {
        return res.status(404).json({ message: "Title not found" });
    }
});


// GET /review/:isbn
// - Returns the `reviews` map for a book (mapping username -> review text).
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found"})
  }
});

module.exports.general = public_users;
