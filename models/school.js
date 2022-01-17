const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  schoolsname: {
    type: String,
    required: true,
  },

  gender: {
    type: String,
    // enum: ["Boys", "Girls", "Mixed"],
    required: true,
  },

  numberOfStudents: {
    type: Number,
    required: true,
  },
  averagAge: {
    type: Number,
    required: true,
  },
  averageMonthlyIncomPerPerson: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  provience: {
    type: String,
  },
  eMail: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  district: {
    type: String,
  },
  village: {
    type: String,
  },
  Street: {
    type: String,
  },
  line: {
    type: String,
  },
  number: {
    type: String,
  },
  postCode: {
    type: String,
  },
  mobileNumber: {
    type: Number,
  },
  location: {
    type: String,
  },
  message: {
    type: String,
  },
  frienship: [
    {
      type: String,
    },
  ],
  requestedfriendto: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewSchool",
    },
    id: String,
  },

  creator: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    username: String,
  },
});

const Newschool = mongoose.model("School", schoolSchema);

module.exports = Newschool;
