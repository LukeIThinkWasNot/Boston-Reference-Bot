const { default: mongoose } = require("mongoose");

let Users = new mongoose.Schema({
	userId: String,
	replyEnabled: Boolean,
});

module.exports = mongoose.model("Users", Users);
