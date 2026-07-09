const express = require('express');
const axios = require('axios'); // CRITICAL: Imported Axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Helper function to check if user exists
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


// Task 10: Get the book list available in the shop using Axios
public_users.get('/', function (req, res) {
    axios.get("http://localhost:5000/")
        .then(response => {
            return res.status(200).json(response.data);
        })
        .catch(error => {
            return res.status(500).json({
                message: error.message
            });
        });
});


// Task 11: Get book details based on ISBN using Axios
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get("http://localhost:5000/")
        .then(response => {
            const book = response.data[isbn];
            if (book) {
                return res.status(200).json(book);
            } else {
                return res.status(404).json({ message: "Book not found" });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching book by ISBN via Axios", error: error.message });
        });
});
  

// Task 12: Get book details based on author using Axios
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    axios.get("http://localhost:5000/")
        .then(response => {
            const keys = Object.keys(response.data);
            let filtered_books = [];

            keys.forEach(key => {
                if (response.data[key].author.toLowerCase() === author.toLowerCase()) {
                    filtered_books.push({ "isbn": key, ...response.data[key] });
                }
            });

            if (filtered_books.length > 0) {
                res.status(200).send(filtered_books);
            } else {
                res.status(404).json({ message: "No books found for this author" });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching author data via Axios", error: error.message });
        });
});


// Task 13: Get all books based on title using Axios
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    axios.get("http://localhost:5000/")
        .then(response => {
            const keys = Object.keys(response.data);
            let filtered_books = [];

            keys.forEach(key => {
                if (response.data[key].title.toLowerCase() === title.toLowerCase()) {
                    filtered_books.push({ "isbn": key, ...response.data[key] });
                }
            });

            if (filtered_books.length > 0) {
                res.status(200).send(filtered_books);
            } else {
                res.status(404).json({ message: "No books found for this title" });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching title data via Axios", error: error.message });
        });
});


// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.status(200).send(book.reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});


// CRITICAL MOCK DATA PATH: Axios requires a true HTTP endpoint to fetch from locally
public_users.get('/books-internal', function (req, res) {
    res.status(200).json(books);
});

module.exports.general = public_users;
