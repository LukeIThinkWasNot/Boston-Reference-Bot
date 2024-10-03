const { default: mongoose } = require("mongoose");

let Schema = new mongoose.Schema({
	maintenance: Boolean,
	maintenanceDetails: String,
	maintenanceMessageID: String,
	restartMessageID: String,
	onlineMessageID: String,
});

module.exports = mongoose.model("maintenance", Schema);
