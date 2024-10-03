require("colors");

/**
 * The severity of a log entry.
 * @enum {number}
 */
const LogLevel = {
	/** Information severity. */
	Info: 0,
	/** Debugging severity. */
	Debug: 1,
	/** Code warning severity. */
	Warn: 2,
	/** Code error severity. */
	Error: 3,
};

/**
 * Makes a log entry.
 * @param {LogLevel} level The severity of the entry.
 * @param {string} message The message to include.
 */

const Log = {
	debug(message) {
		logToConsole(LogLevel.Debug, message);
	},

	info(message) {
		logToConsole(LogLevel.Info, message);
	},

	warn(message) {
		logToConsole(LogLevel.Warn, message);
	},

	error(message) {
		logToConsole(LogLevel.Error, message);
	},
};

async function logToConsole(level, message) {
	let levelMessage = "";

	switch (level) {
		case LogLevel.Info:
			levelMessage = "[INFO]".magenta;
			break;
		case LogLevel.Debug:
			levelMessage = "[DEBUG]".blue;
			break;
		case LogLevel.Warn:
			levelMessage = "[WARNING]".yellow;
			break;
		case LogLevel.Error:
			levelMessage = "[ERROR]".red;
			break;
	}
	if (levelMessage === undefined || levelMessage === null) {
		levelMessage = "";
	}

	let logMSG = `${await timeStringNow()} ${levelMessage} | ${String(
		message
	)}`;

	console.log(logMSG);
}

async function timeStringNow() {
	const now = new Date();
	return `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1)
		.toString()
		.padStart(2, "0")}-${now
		.getFullYear()
		.toString()
		.padStart(4, "0")} ${now.getHours().toString().padStart(2, "0")}:${now
		.getMinutes()
		.toString()
		.padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}:${now
		.getMilliseconds()
		.toString()
		.padStart(3, "0")} CST`;
}

module.exports = Log;
