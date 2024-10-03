const { default: mongoose } = require("mongoose");
const Log = require("./log");
const config = require("../config.json");
const fs = require("fs");
const path = require("path");
const si = require("systeminformation");
const os = require("os");

function getConfig() {
	return config;
}

function isTestBot(client) {
	if (!client) {
		throw Error("Client is not defined in isTestBot function.");
	}

	if (!client.user) return true;

	return false;
}

async function connectToDatabase(client) {
	if (mongoose.connection.readyState === 1) {
		Log.info("MongoDB has already connected.");
		return true;
	}
	mongoose.set("strictQuery", true);

	return await mongoose
		.connect(`${process.env.mongo_url}`)
		.then(async (connection) => {
			mongoose.Promise = global.Promise;
			client.mongo = connection;

			// const maintenance = await Maintenance.findOne();
			// client.maintenance = maintenance ? maintenance : {};

			Log.info("MongoDB has connected!");
			return true;
		})
		.catch((err) => {
			Log.error("There was an error connecting to mongo");
			console.error(err);
			return false;
		});
}

async function devModeEnabled(client) {
	// return true;
	if (isTestBot(client)) return true;
	// const maintenance = await Maintenance.findOne();
	// return maintenance && maintenance.maintenance;
}

function loadPackages(client) {
	const dirs = fs.readdirSync("node_modules");
	const packages = [];
	dirs.forEach(function (dir) {
		try {
			let existingPath = path.join("node_modules", dir, "package.json");
			if (fs.existsSync(existingPath)) {
				const json = JSON.parse(fs.readFileSync(existingPath, "utf8"));
				packages.push({
					name: dir,
					version: json.version,
				});
			}
		} catch (e) {
			console.log(`failed to read/parse package.json for ${dir}`, e);
		}
	});

	client.packages = packages;
}

function getCallerFileInfo(linesToAdd) {
	try {
		throw new Error();
	} catch (e) {
		const stackLines = e.stack?.split("\n");
		if (stackLines && stackLines.length >= 4) {
			// The caller's file information is usually in the fourth line of the stack trace
			const callerLine =
				stackLines[3 + (linesToAdd ? linesToAdd : 0)].trim();
			// Extract file path, line number, and file name from the caller line
			const matches = callerLine.match(/\((.*):(\d+):(\d+)\)/);
			if (matches && matches.length === 4) {
				const filePath = matches[1];
				const lineNumber = parseInt(matches[2]);
				const fileName = filePath.split("/").pop() || ""; // Get the last part as the file name
				return { fileName, filePath, lineNumber };
			}
		}
	}
	return null; // Return null if caller's file information couldn't be retrieved
}

function getCallerInfoFormatted(linesToAdd) {
	const callerInfo = getCallerFileInfo(linesToAdd);
	if (!callerInfo) return "Unknown location";
	return `${callerInfo.fileName}:${callerInfo.lineNumber}`;
}

function replaceAll(input, search, replacement) {
	return input.replace(new RegExp(search, "g"), replacement);
}

function stringWithNoTabs(string) {
	return replaceAll(string, `\u0009`, ``);
}

function escapeMarkdown(text) {
	if (!text) return "";
	const specialCharacters = ["\\", "`", "*", "_", "#", "|"];

	let escapedText = text;

	for (const char of specialCharacters) {
		const escapedChar = "\\" + char;
		const regex = new RegExp(`\\${char}`, "g");
		escapedText = escapedText.replace(regex, escapedChar);
	}

	return escapedText;
}

async function getChannelFromGuild(client, guild, channel) {
	if (typeof guild === "string") guild = await client.guilds.fetch(guild);
	if (!guild) return null;
	if (!channel) return null;
	return await guild.channels.fetch(channel);
}

function getClientUptime(client) {
	const timestamp = client.readyAt;
	if (!timestamp) return "Unknown";
	const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
	const uptimeParts = [
		Math.floor(seconds / 86400),
		Math.floor((seconds % 86400) / 3600),
		Math.floor((seconds % 3600) / 60),
		seconds % 60,
	]
		.map((time, index) =>
			time > 0
				? `${time} ${["day", "hour", "minute", "second"][index]}${time !== 1 ? "s" : ""}`
				: ""
		)
		.filter((time) => time !== "");

	return uptimeParts.join(", ");
}

function isDev(id) {
	return getConfig().developers.includes(id);
}

async function getDatabasePing(client) {
	const currentNano = process.hrtime();
	await client.mongo.connection.db.command({ ping: 1 });
	const time = process.hrtime(currentNano);
	return (time[0] * 1e9 + time[1]) * 1e-6;
}

/**
 * Retrieves system information including CPU details, RAM usage, OS information, and disk details.
 * @returns {Promise<{
 *   cpu: {
 *     brand: string;
 *     manufacturer: string;
 *     speed: string;
 *     cores: number;
 *   };
 *   ram: {
 *     total: string;
 *     active: string;
 *   };
 *   os: {
 *     platform: string;
 *     distro: string;
 *     release: string;
 *   };
 *   disk: {
 *     manufacturer: string;
 *     model: string;
 *     size: string;
 *   };
 * }>} A promise that resolves with an object containing system information.
 */
async function getSystemInfo() {
	// CPU Information
	const cpuInfo = await si.cpu();

	// RAM Information
	const totalRam = os.totalmem();
	const activeRam = os.freemem();

	const formatRam = (bytes) => {
		const gb = bytes / (1024 * 1024 * 1024);
		if (gb < 1) {
			return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
		}
		return `${gb.toFixed(2)} GB`;
	};

	// OS Information
	const osInfo = {
		platform: os.platform(),
		distro: os.type(),
		release: os.release(),
	};

	// Disk Information
	const diskInfo = await si.diskLayout();
	const primaryDisk = diskInfo[0];

	return {
		cpu: {
			brand: cpuInfo.brand,
			manufacturer: cpuInfo.manufacturer,
			speed: `${cpuInfo.speed}`,
			cores: cpuInfo.cores,
		},
		ram: {
			total: formatRam(totalRam),
			active: formatRam(totalRam - activeRam),
		},
		os: osInfo,
		disk: {
			manufacturer: primaryDisk.vendor,
			model: primaryDisk.name,
			size: `${(primaryDisk.size / (1024 * 1024 * 1024)).toFixed(2)} GB`,
		},
	};
}

function truncateMessage(maxLength, message) {
	if (!message) return "";
	if (message.length > maxLength) {
		return message.slice(0, maxLength) + "...";
	} else {
		return message;
	}
}

function timeInStringReg(delimiter) {
	delimiter = delimiter.charAt(0);
	const escapedDelimiter = delimiter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	const pattern = `${escapedDelimiter}((([1-9]|1[0-9]|2[0-3])(:|\\.[0-5][0-9])?\\s?[ap][m])|(([0-9]|1[0-9]|2[0-3]):[0-5][0-9]))( \\(?[\\w/-]+( [\\w/-]+)*\\)?)?${escapedDelimiter}`;

	return new RegExp(pattern, "gi");
}

async function handleError(error) {
	let notice = "A client error occurred: " + error.message;
	if (error.stack) {
		const stackLines = error.stack.split("\n");
		// Find the first stack line that doesn't contain node_modules (indicating your code)
		const fileLine = stackLines.find(
			(line) => !line.includes("node_modules")
		);
		if (fileLine) {
			// Extract file path and line number
			const matchResult = /\((.*):(\d+):(\d+)\)/.exec(fileLine);
			if (matchResult && matchResult.length >= 4) {
				const filePath = matchResult[1];
				const lineNumber = matchResult[2];
				const columnNumber = matchResult[3];
				notice += `\nError occurred in file: ${filePath} at line ${lineNumber}, column ${columnNumber}`;
			}
		}
	}
	Log.error(notice);
}

module.exports = {
	isTestBot,
	getConfig,
	connectToDatabase,
	devModeEnabled,
	loadPackages,
	getCallerFileInfo,
	getCallerInfoFormatted,
	replaceAll,
	stringWithNoTabs,
	escapeMarkdown,
	getChannelFromGuild,
	getClientUptime,
	isDev,
	getDatabasePing,
	getSystemInfo,
	truncateMessage,
	timeInStringReg,
	handleError,
};
