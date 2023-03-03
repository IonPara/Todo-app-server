const jwt = require("jsonwebtoken");
const User = require("../models/mongoose");
const bcrypt = require("bcrypt");
const path = require("path");

require("dotenv").config({ path: "./app.env" });

async function getUsers(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Invalid user" });
    console.log(error);
  }
}

// Login middleware
// Checks the user's name and password with the ones from the database and if they match it creates a JWT token
const login = async (req, res) => {
  try {
    const { password, username } = req.body;
    const userInformation = await User.findOne({ username });
    if (userInformation) {
      const auth = await bcrypt.compare(password, userInformation.password);
      if (auth) {
        let jwtToken = jwt.sign(
          {
            username: userInformation.username,
          },
          process.env.ACCESS_TOKEN,
          { expiresIn: "1h" }
        );
        res.json({ token: jwtToken });
      } else {
        res.json({ message: "Invalid password" });
      }
    } else {
      res.json({ message: "Invalid username" });
    }
  } catch (error) {
    console.error(error);
  }
};

// Check JWT middleware will check the given token
function checkJWTToken(req, res, next) {
  if (req.headers.token) {
    let token = req.headers.token;
    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, data) {
      if (error) {
        res.send({ message: "Invalid Token" });
        next();
      } else {
        req.username = data.username;
        next();
      }
    });
  } else {
    res.send({ message: "No token attached to the request" });
  }
}

// Sign up middleware
// It will check if the username includes @gmail.com, if the user doesn't exist, if the password is greater than 6 and if the password matches
// It will create a new user document with username and password
// If something doesn't it will send an error message
async function signUp(req, res, next) {
  const { name, password, username } = req.body;
  const userExists = await User.findOne({ username: username });
  if (
    username.includes("@gmail.com") &&
    !userExists &&
    password.length >= 6 &&
    password == req.body.confirmPassword
  ) {
    const newUser = new User({
      name: name,
      username: username,
      password: password,
      todo: [],
    });
    try {
      await newUser.save();
      res.json({ message: "Account successfully created" });
      next();
    } catch (error) {
      console.error(error);
    }
  } else if (!username.includes("@gmail.com")) {
    res.send({
      status: 403,
      message: `The username should include @gmail.com.`,
    });
  } else if (userExists) {
    res.send({
      status: 403,
      message: `The username already exists, try again.`,
    });
  } else if (password.length < 6) {
    res.send({
      message: "The password has to be a minimum of six characters.",
    });
  } else {
    res.send({
      message: `Password and Confirmation Password does not match.`,
    });
  }
}

// Add todo middleware that will find the user in the database
// It will check if the content doesn't exceed 140 characters
// If it doesn't it will push the new value to the user's todo
// Else it will send an error message
async function addTodo(req, res) {
  const { content, username, id } = req.body;
  const user = User.findOne({ username: username });
  if (user && content.length < 140) {
    try {
      await User.updateOne(
        { username: username },
        {
          $push: {
            todo: {
              _id: id,
              content: content,
              completed: false,
            },
          },
        }
      );
      res.json({ message: "Todo successfully added!" });
    } catch (error) {
      console.log(error);
    }
  } else if (content.length > 140) {
    res.send({
      message: "The content exceeds 140 characters.",
    });
  }
}

// This middleware will check if the content is a JSON type
function checkContentType(req, res, next) {
  if (req.headers["content-type"] == "application/json") {
    next();
  } else {
    res.send({ status: 406, message: "We only accept JSON content type." });
  }
}

// Delete middleware
// It will find the item that matches the username and the id, and remove it from the list
async function deleteTodo(req, res) {
  try {
    const { username, id } = req.body;
    await User.updateOne(
      { username: username },
      {
        $pull: {
          todo: {
            _id: id,
          },
        },
      }
    );
    res.send({ message: "Success" });
  } catch (error) {
    console.error(error);
  }
}

// Edit middleware
// It will find the item that matches the username and the id, and update the content
async function editTodo(req, res) {
  try {
    const { content, username, id, completed } = req.body;
    await User.updateOne(
      { username: username, "todo._id": id },
      {
        $set: {
          "todo.$.content": content,
          "todo.$.completed": completed,
        },
      }
    );
    res.send({ message: "Success" });
  } catch (error) {
    console.error(error);
  }
}

// Export all of the middleware
module.exports = {
  checkJWTToken,
  signUp,
  addTodo,
  deleteTodo,
  editTodo,
  getUsers,
  checkContentType,
  login,
};
