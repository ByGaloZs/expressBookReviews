# expressBookReviews

Server-side **Online Book Review API** built with **Node.js + Express**.
---

## Getting Started

### Prerequisites

- Node.js (recommended: latest LTS)
- npm

### Install

```bash
git clone https://github.com/ByGaloZs/expressBookReviews.git
cd expressBookReviews/final_project
npm install
```

### Run

```bash
npm start
```

By default, the server runs on:

- http://localhost:5000

---

## API Overview

### Base URL

```
http://localhost:5000
```

---

## Public Routes (No Authentication Required)

### Get all books
**GET** `/`

```bash
curl http://localhost:5000/
```

### Get book details by ISBN
**GET** `/isbn/:isbn`

```bash
curl http://localhost:5000/isbn/1234
```

### Get books by author
**GET** `/author/:author`

```bash
curl "http://localhost:5000/author/Chinua%20Achebe"
```

### Get books by title
**GET** `/title/:title`

```bash
curl "http://localhost:5000/title/Things%20Fall%20Apart"
```

### Get reviews for a book
**GET** `/review/:isbn`

```bash
curl http://localhost:5000/review/1234
```

---

## Authentication Routes

### Register a new user
**POST** `/customer/register`

```json
{
  "username": "ByGaloZs",
  "password": "123456"
}
```

### Login
**POST** `/customer/login`

---

## Protected Routes (JWT Required)

### Add or update a book review
**PUT** `/customer/auth/review/:isbn`

### Delete a book review
**DELETE** `/customer/auth/review/:isbn`

---

## Notes

- In-memory data storage (resets on server restart)
- JWT authentication with express-session
- Educational project

---

## License

Apache License 2.0

---

## Author

**Mario Padilla**
