/*

args: {
		client: Client;
		commandsFolder: string;
		token: string;
	}

*/

const { Routes, Collection, REST } = require("discord.js");
const Log = require("./log");
const path = require("path");
const { isTestBot, getConfig } = require("./utils");
const fs = require("fs");

/**
 * Options for sending a message or interaction response.
 * @typedef {Object} registerSlashCommandsArgs
 * @property {Client} client - The Discord.js client.
 * @property {string} commandsFolder - The folder containing the slash commands.
 */

/**
 * Options for sending a message or interaction response.
 * @typedef {Object} registerTextCommandArgs
 * @property {Client} client - The Discord.js client.
 * @property {string} commandsFolder - The folder containing the slash commands.
 * @property {string} token - The bot token.
 * @property {boolean} [debug] - Whether to log debug messages.
 */

function readTasksRecursively(client, folderPath) {
	let files = fs.readdirSync(folderPath, { recursive: true });
	files = files.filter((f) => f.endsWith(".js"));
	files.forEach((file) => {
		const filePath = path.join(folderPath, file);

		if (fs.statSync(filePath).isDirectory()) {
			readTasksRecursively(filePath);
		} else {
			try {
				const task = require(filePath);
				if (task) {
					if (task.startAfterLoaded) {
						Log.info(
							`[Loaded] | AFTER FULL START | Task | ${file}`
						);

						if (!client.tasksToStartAfterReady) {
							client.tasksToStartAfterReady = [];
						}

						client.tasksToStartAfterReady.push(task);
						return;
					}

					if (!task.execute)
						return Log.error(
							`[ERROR] | Failed to load Task | ${file} | No execute function found.`
						);

					if (task.runOnLoad) {
						task.execute(client);
					}

					setInterval(() => {
						task.execute(client);
					}, task.time);
					Log.info(`[Loaded] | Task | ${file}`);
				}
			} catch (err) {
				Log.error(`[ERROR] | Failed to load Task | ${file}`);
				Log.error(err);
			}
		}
	});
}

/**
 * Load a command from a file to the client.
 *
 * @param {Client} client - The DJS client.
 * @param {string} commandpath - The path to the command file.
 * @param {boolean} [debug] - Whether to log debug messages.
 * @returns {boolean} - Whether the command was loaded.
 */
function loadCommand(client, commandpath, debug) {
	try {
		const option = require(commandpath);

		delete require.cache[require.resolve(commandpath)];

		let { command, aliases } = option;

		client.textcommands.set(command.toLowerCase(), { ...option });
		client.textcommandfilepath.set(command.toLowerCase(), commandpath);

		if (aliases) {
			for (const alias of aliases) {
				client.textcommandalias.set(
					alias.toLowerCase(),
					command.toLowerCase()
				);
				if (debug) Log.info(`[Alias]  | Command Alias | ${alias}`);
			}
		}

		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

module.exports = {
	/**
	 * Register slash commands for a client.
	 *
	 * @param {registerSlashCommandsArgs} args - The interaction or channel to send the message to.
	 * @returns {Promise<void>}
	 */
	registerSlashCommands: async function (args) {
		const { client, commandsFolder, token } = args;
		const rest = new REST({ version: "10" }).setToken(`${token}`);
		client.slashcommands = new Collection();
		client.slashcommandsArray = [];
		const commandPath = path.join(__dirname, "..", commandsFolder);
		const config = getConfig();

		async function loadSlashCommands(directory) {
			let entries = fs.readdirSync(directory, {
				withFileTypes: true,
			});
			entries = entries.filter((f) => f.name.endsWith(".js"));
			for (const entry of entries) {
				const fullPath = path.join(directory, entry.name);

				if (entry.isDirectory()) {
					await loadSlashCommands(fullPath);
				} else if (entry.isFile()) {
					Log.info(`[Get] | Slash Command | ${entry.name}`);

					try {
						let cmd = require(fullPath);

						if (!cmd || Object.keys(cmd || {}).length === 0) {
							Log.error(
								`[ERROR]  | Failed to load Slash Command | ${entry.name} | Invalid module data`
							);
							continue;
						}

						if (
							isTestBot(client) &&
							cmd.commandType !== "ChatInput" &&
							!config.allowContextMenuCommandsInDevMode
						) {
							Log.warn(
								`[WARN]  | Failed to load Slash Command | ${entry.name} | Context Menu Commands are not loaded on the test bot.`
							);
							continue;
						}

						if (
							!isTestBot(client) &&
							directory.toLowerCase().includes("testing")
						) {
							Log.warn(
								`[WARN]  | Failed to load Slash Command | ${entry.name} | Test commands are not loaded on main bot.`
							);
							continue;
						}

						cmd["dirname"] = path.dirname(
							require.resolve(fullPath)
						);

						if (cmd.events) {
							cmd.events(client);
						}

						client.slashcommands.set(cmd.data.name, cmd);
						client.slashcommandsArray.push(cmd.data.toJSON());

						Log.info(`[Loaded]  | Slash Command | ${entry.name}`);
					} catch (err) {
						Log.error(
							`[ERROR]  | Failed to load Slash Command | ${entry.name}`
						);
						console.error(err);
					}
				}
			}
		}

		if (!fs.existsSync(commandPath)) {
			Log.error(
				`[ERROR] | Slash Command folder does not exist at ${commandPath}`
			);
			return false;
		}

		await loadSlashCommands(commandPath);

		const globalCommands = client.slashcommands
			.filter((cmd) => "data" in cmd)
			.map((command) => command.data.toJSON());

		try {
			Log.info("Registering all global (/) commands.");

			await rest.put(Routes.applicationCommands(client.user.id || ""), {
				body: globalCommands,
			});
		} catch (error) {
			console.error(error);
			return false;
		}

		return true;
	},

	/**
	 * Register text commands for a client.
	 *
	 * @param {registerTextCommandArgs} args - The interaction or channel to send the message to.
	 * @returns {Promise<void>}
	 */
	registerTextCommands: async function (args) {
		const { client, commandsFolder, debug } = args;
		client.textcommands = new Collection();
		client.textcommandalias = new Collection();
		client.textcommandfilepath = new Collection();
		const commandPath = path.join(__dirname, "..", commandsFolder);

		if (!fs.existsSync(commandPath)) {
			Log.error(
				`[ERROR] | Text Command folder does not exist at ${commandPath}`
			);
			return false;
		}

		const readCommands = async (dir) => {
			let files = fs.readdirSync(dir, { recursive: true });
			files = files.filter((f) => f.endsWith(".js"));
			for (const file of files) {
				const stat = fs.lstatSync(path.join(dir, file));
				if (stat.isDirectory()) {
					readCommands(path.join(dir, file));
				} else {
					if (debug) Log.info(`[Loading] | Log Command | ${file}`);
					let loaded = loadCommand(
						client,
						path.join(dir, file),
						debug
					);
					if (loaded && debug)
						Log.info(`[Loaded]  | Log Command | ${file}`);
					else if (!loaded)
						Log.error(`There was an error loading ${file}`);
				}
			}
		};

		readCommands(commandPath);
		return true;
	},

	/**
	 * Register events for a client.
	 * @param {Client} client - The Discord.js client.
	 * @param {string} eventFolder - The folder containing the events.
	 * @returns {Promise<void>}
	 */
	registerEvents: async function (client, eventFolder) {
		const eventPath = path.join(__dirname, "..", eventFolder);

		const readFilesRecursively = (directory) => {
			let files = fs.readdirSync(directory, { recursive: true });
			files = files.filter((f) => f.endsWith(".js"));

			files.forEach((file) => {
				const filePath = path.join(directory, file);
				const stats = fs.statSync(filePath);

				if (stats.isDirectory()) {
					readFilesRecursively(filePath);
				} else {
					Log.info(`[Loading] | Event | Registering event ${file}`);
					const event = require(filePath);
					Log.info(`[Loaded] | Event | ${file}`);

					if (event.ignoreUntilStart) {
						client.eventsToStartAfterReady.push(event);
						Log.info(`[Waiting] | Event | ${file}`);
						return;
					}

					if (event.once) {
						client.once(event.name, (...args) =>
							event.execute(client, ...args)
						);
					} else {
						client.on(event.name, (...args) =>
							event.execute(client, ...args)
						);
					}
					Log.info(`[Started] | Event | ${file}`);
				}
			});
		};

		if (!fs.existsSync(eventPath)) {
			Log.error(`[ERROR] | Event folder does not exist at ${eventPath}`);
			return false;
		}

		readFilesRecursively(eventPath);

		return true;
	},

	registerTasks: function (client, taskFolder) {
		const taskPath = path.join(__dirname, "..", taskFolder);
		if (!fs.existsSync(taskPath)) {
			Log.error(`[ERROR] | Task folder does not exist at ${taskPath}`);
			return false;
		}
		readTasksRecursively(client, taskPath);
		return true;
	},
};
