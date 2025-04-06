const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const session = require('express-session')
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
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
//write code to check if username and password match the one we have in records.
    // Filter the users array for any user with the same username and password
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
    if (!username || !password) {
        return res.status(404).json({ message: "Body empty" });
    }

    // Authenticate user
    
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

function stringify(obj) {
  let cache = [];
  let str = JSON.stringify(obj, function(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null; // reset the cache
  return str;
}

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const username = req.session.authorization["username"];
  const isbn = req.params.isbn;
  const review = req.query.review; 
  //res.send(stringify(req));
  if (!username || !review || !isbn) {
      return res.status(404).json({ message: "Body empty" });
  }
  if (isValid(username)) {
    //return res.send(req.session.authorization);
    books[isbn]["reviews"][username] = {"review": review};
    return res.send(books[isbn])
  }
  //return res.send(req.session)
  //return res.send(books[1]);
  //return res.status(300).json({message: "Yet to be implemented auth review"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    //Write your code here
    const username = req.session.authorization["username"];
    const isbn = req.params.isbn;

    if (!username || !isbn) {
        return res.status(404).json({ message: "Body empty" });
    }
    if (isValid(username)) {
      delete books[isbn]["reviews"][username];
      return res.send(books[isbn])
    }
    //return res.send(req.session)
    //return res.send(books[1]);
    //return res.status(300).json({message: "Yet to be implemented auth review"});
  });

// Check username
regd_users.get("/checkusername", (req, res) => {
    //Write your code here
    const username = req.session.authorization["username"];
    return res.send(username)
    //return res.send(req.session)
    //return res.send(books[1]);
    //return res.status(300).json({message: "Yet to be implemented auth review"});
  });


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
