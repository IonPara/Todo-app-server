const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// Create a schema for our documents
let UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  todo: [
    {
      _id: {
        type: Number,
      },
      content: {
        type: String,
      },
      completed: {
        type: Boolean,
      },
    },
  ],
  password: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});
// Encrypt the passwords
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// module.exports makes the model available outside of your module
const User = mongoose.model("User", UserSchema);
module.exports = User;
