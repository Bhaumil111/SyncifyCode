const mongoose = require("mongoose");

//Schema
const roomdata = mongoose.Schema({
  roomid: {
    type: String,
  },
  code: {
    type: String,
    default: "",
  },
  username: [
    {
      type: String,
    },
  ],
});

//Collection
const Room = mongoose.model("Room", roomdata);

module.exports = Room;
