// Public routes for browsing books and registering users.
// This router exposes endpoints used by unauthenticated clients.
const express = require('express');
const axios = require("axios");
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


// GET all books using async/await with Axios
public_users.get("/async/books", async (req, res) => {
  try {
    // Call the existing "get all books" endpoint
    const response = await axios.get("http://localhost:5000/");

    // Return the data received from the server
    return res.status(200).json(response.data);
  } catch (error) {
    // Handle errors from Axios/network
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
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


// GET book details by ISBN using async/await with Axios
public_users.get("/async/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;

    // Call the existing endpoint
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);

    return res.status(200).json(response.data);
  } catch (error) {
    // If the called endpoint returns 404, Axios throws and we land here
    return res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
  }
});


// GET /author/:author
// - Finds books by exact author match and returns an array of matching book objects.
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const result = Object.keys(books).filter(key => books[key].author === author).map(key => books[key]);
  return res.status(200).send(JSON.stringify(result, null, 4));
});


// GET book details by Author using async/await with Axios
public_users.get("/async/author/:author", async (req, res) => {
  try {
    const author = req.params.author;

    // Call the existing endpoint
    const response = await axios.get(
      `http://localhost:5000/author/${author}`
    );

    return res.status(200).json(response.data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching books by author", error: error.message });
  }
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


// GET book details by Title using async/await with Axios
public_users.get("/async/title/:title", async (req, res) => {
  try {
    const title = req.params.title;

    // Call the existing endpoint 
    const response = await axios.get(`http://localhost:5000/title/${title}`);

    return res.status(200).json(response.data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching books by title", error: error.message });
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
