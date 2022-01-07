const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let textSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },

  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
    name: String,
  },
});

textSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Text", textSchema);
