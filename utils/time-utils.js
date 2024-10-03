const moment = require("moment");

/**
 * Enumeration of Discord Unix timestamp formats.
 * @readonly
 * @enum {string}
 */
const discordUnixFormats = {
	ShortTime: "t",
	LongTime: "T",
	ShortDate: "d",
	LongDate: "D",
	DateTime: "f",
	WeekdayDateTime: "F",
	RelativeTime: "R",
};

function getUnixTime() {
	return Date.now();
}

function getUnixTimeSeconds() {
	return Math.floor(Date.now() / 1000);
}

function getMomentInEST() {
	return moment().tz("America/New_York");
}

function isWeekend() {
	const day = this.getMomentInEST().day();
	if (day === 0 || day === 6) return true;
	return false;
}

/**
 * Type definition for Discord Unix formats.
 * @typedef {keyof typeof discordUnixFormats} discordUnixFormatsType
 */

/**
 * Converts a Unix timestamp to a Discord timestamp string.
 *
 * @param {discordUnixFormatsType} timestampType - The format type for the timestamp.
 * @param {number} timestamp - The Unix timestamp to convert.
 * @returns {string} The formatted Discord timestamp string.
 */
function unixToDiscordTimestamp(timestampType, timestamp) {
	return `<t:${timestamp}:${discordUnixFormats[timestampType]}>`;
}

module.exports = {
	getUnixTime,
	getUnixTimeSeconds,
	getMomentInEST,
	isWeekend,
	unixToDiscordTimestamp,
};
