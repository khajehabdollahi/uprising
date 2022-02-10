const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: String,
  name: {
    type: String,
    required: true,
  },

  activated: {
    type: Boolean,
  },
  proficiency: {
    type: String,
  }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
