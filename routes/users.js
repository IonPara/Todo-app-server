var express = require("express");
var router = express.Router();
// import all of the middleware
const {
  signUp,
  addTodo,
  getUsers,
  deleteTodo,
  editTodo,
  checkJWTToken,
  checkContentType,
  login,
} = require("../controllers/users.controllers");

// Here are all of the routes
router.post("/login", checkContentType, login);
router.post("/signUp", checkContentType, signUp);
router.post("/addTodo", checkContentType, addTodo);
router.get("/:username", checkContentType, checkJWTToken, getUsers);
router.delete("/delete", checkContentType, deleteTodo);
router.put("/edit", checkContentType, editTodo);

module.exports = router;
