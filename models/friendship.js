const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema({
  friendrequesterId: {
    type: String,
  },
  schoolId: {
    type: String,
  },
  confirmation: {
    type: String,
    default: "Waiting for confirmation",
  },
  friendrequestersname: {
    type: String,
  },
});

const Friendship = mongoose.model("Friendship", friendshipSchema);

module.exports = Friendship;
