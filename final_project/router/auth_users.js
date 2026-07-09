const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}


const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}


//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 }); // Token expiry extended for testing stability

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review; // Fetches review text from query parameters
    
    // Retrieve username stored in the session by your login route
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "User not authenticated. Please log in." });
    }

    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required as a query parameter (?review=text)" });
    }

    // Verify if the book exists in the database
    if (books[isbn]) {
        // Create the reviews object if it doesn't exist
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        // Add or modify the review under the specific username key
        books[isbn].reviews[username] = reviewText;

        return res.status(200).json({ 
            message: `The review for the book with ISBN ${isbn} has been added/updated successfully.` 
        });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});


// Delete a book review (Task 9 requirement)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "User not authenticated." });
    }

    if (books[isbn]) {
        // Check if a review from this specific user exists
        if (books[isbn].reviews && books[isbn].reviews[username]) {
            delete books[isbn].reviews[username]; // Delete the user's specific review
            return res.status(200).json({ message: `Reviews for ISBN ${isbn} posted by user ${username} deleted.` });
        } else {
            return res.status(404).json({ message: "No review found for this user on this book." });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
