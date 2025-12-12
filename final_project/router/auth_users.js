// Router for registered-user actions (login, add/modify reviews)
const express = require('express');
const jwt = require('jsonwebtoken');
// booksdb exports an in-memory object keyed by ISBN: { isbn: { title, author, reviews: { username: review }}}
let books = require("./booksdb.js");
const regd_users = express.Router();

// In-memory array of registered users for this exercise/sample app.
// Each user object is expected to be: { username: string, password: string }
let users = [];

// Check whether a username is already taken. Returns true when found.
const isValid = (username) => {
  let userwithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userwithsamename.length > 0;
};

// Validate credentials against the in-memory `users` list.
// Returns true when a user with matching username+password exists.
const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
}

// POST /login
// - Expects `username` and `password` in `req.body`.
// - On success creates a JWT (signed with the literal 'access' secret in this sample)
//   and stores `{ accessToken, username }` on `req.session.authorization`.
// - This sample app uses session storage rather than sending the token to the client.
// Notes: This is intentionally simple for the tutorial — do NOT use the 'access' secret
// or store plain passwords in production.
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Basic presence check for credentials
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Validate against registered users
  if (authenticatedUser(username, password)){
    // Create a short-lived JWT. Payload here stores the password as `data` (tutorial only).
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60});

    // Store token + username in session for later authorization checks
    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// PUT /auth/review/:isbn
// - Adds or updates the current logged-in user's review for the book with the given ISBN.
// - Review text is expected in the query string as `?review=...` (this project uses query for simplicity).
// - Uses `req.session.authorization.username` to determine the reviewer.
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization ? req.session.authorization.username : null;

  // Require authentication via session
  if (!username) {
    return res.status(403).json({ message: "User not Logged in"});
  }

  // Require review content
  if (!review) {
    return res.status(400).json({ message: "Review content is requires"});
  }

  // Look up the book by ISBN in the `books` object from `booksdb.js`
  const book = books[isbn];
  if (!book){
    return res.status(404).json({ message: "Book not found"});
  }

  // Ensure a `reviews` map exists on the book object and set the user's review.
  // Reviews are stored as `book.reviews[username] = review` so each user has one review per book.
  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added/modified successfully", reviews: book.reviews});
});

// DELETE request: Delate the review of the logged-in user for a specific ISBN
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Extract ISBN fromm route parameters
  const isbn = req.params.isbn;

  // Get username from session authorization
  const username = req.session.authorization ? req.session.authorization.username : null;

  // Check if user is logged in
  if(!username) {
    return res.status(403).json({ message: "User not Logged in"});
  }
  
  // Check if the book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review for the book
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Delete the user's review
  delete book.reviews[username];

  // Send success response
  return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews});

});

// Export router and helper utilities used elsewhere in the app.
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
