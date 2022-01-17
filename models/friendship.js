const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema({
  //The Id of the school which receives friendship request
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
  friendrequestersschoolsname: {
    type: String,
  },
  friendrequesterid: {
    type: String,
  },

  friendshipRequestersSchoolsName: {
    type: String,
  },
  friendshipRequestedsSchoolsName: {
    type: String,
  },
  friendshipRequesterSchoolId: {
    type:String
  },
  userIdWhichReceivedFriendshipRequest: {
    type:String
  },

  date: {
    type: String,
  },
});

const Friendship = mongoose.model("Friendship", friendshipSchema);

module.exports = Friendship;
