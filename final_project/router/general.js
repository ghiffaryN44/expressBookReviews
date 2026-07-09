const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Helper function to check if the user already exists
const doesExist = (username) => {
    let userswithsamename = users.filter((user) => user.username === username);
    return userswithsamename.length > 0;
};


// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username || req.query.username;
    const password = req.body.password || req.query.password;

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});


// Task 10: Get the book list available in the shop using native Promises
public_users.get('/', function (req, res) {
    const getBooksPromise = new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject({ message: "Database error. Could not retrieve books." });
        }
    });

    getBooksPromise
        .then((bookList) => {
            res.status(200).send(JSON.stringify(bookList, null, 4));
        })
        .catch((error) => {
            res.status(500).json(error);
        });
});


// Task 11: Get book details based on ISBN using native Promises
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const getBookByISBNPromise = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ message: "Book not found" });
        }
    });

    getBookByISBNPromise
        .then((bookData) => {
            res.status(200).send(bookData);
        })
        .catch((error) => {
            res.status(404).json(error);
        });
});
  

// Task 12: Get book details based on author using native Promises
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    const getBooksByAuthorPromise = new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        let filtered_books = [];

        keys.forEach(key => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                filtered_books.push({ "isbn": key, ...books[key] });
            }
        });

        if (filtered_books.length > 0) {
            resolve(filtered_books);
        } else {
            reject({ message: "No books found for this author" });
        }
    });

    getBooksByAuthorPromise
        .then((foundBooks) => {
            res.status(200).send(foundBooks);
        })
        .catch((error) => {
            res.status(404).json(error);
        });
});


// Task 13: Get all books based on title using native Promises
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    const getBooksByTitlePromise = new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        let filtered_books = [];

        keys.forEach(key => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                filtered_books.push({ "isbn": key, ...books[key] });
            }
        });

        if (filtered_books.length > 0) {
            resolve(filtered_books);
        } else {
            reject({ message: "No books found for this title" });
        }
    });

    getBooksByTitlePromise
        .then((foundBooks) => {
            res.status(200).send(foundBooks);
        })
        .catch((error) => {
            res.status(404).json(error);
        });
});


// Task 5: Get book reviews based on ISBN (Kept synchronous as per lab instructions)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.status(200).send(book.reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});


module.exports.general = public_users;
