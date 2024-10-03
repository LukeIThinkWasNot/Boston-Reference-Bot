const { ClusterClient, getInfo } = require("discord-hybrid-sharding");
const {
	Client,
	Partials,
	GatewayIntentBits,
	Collection,
	ActivityType,
} = require("discord.js");
const {
	connectToDatabase,
	devModeEnabled,
	isTestBot,
	getConfig,
	loadPackages,
	handleError,
} = require("../utils/utils");
const Log = require("../utils/log");
const {
	registerEvents,
	registerSlashCommands,
	registerTasks,
	registerTextCommands,
} = require("../utils/register-utils");

(async () => {
	let clientInfo = {
		partials: [
			Partials.Message,
			Partials.Channel,
			Partials.Reaction,
			Partials.User,
			Partials.GuildMember,
			Partials.ThreadMember,
		],
		intents: [
			GatewayIntentBits.AutoModerationExecution,
			GatewayIntentBits.AutoModerationConfiguration,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.DirectMessageTyping,
			GatewayIntentBits.DirectMessagePolls,
			GatewayIntentBits.DirectMessageReactions,
			GatewayIntentBits.GuildInvites,
			GatewayIntentBits.GuildIntegrations,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildWebhooks,
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildModeration,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildMessagePolls,
			GatewayIntentBits.MessageContent,
		],
	};

	const client = new Client({
		...clientInfo,
		shards: getInfo().SHARD_LIST,
		shardCount: getInfo().TOTAL_SHARDS,
	});

	client.cluster = new ClusterClient(client);
	Log.info(`Starting cluster ${client.cluster.id}`);
	let token = process.env.client_token;
	if (!token) return Log.error("Failed to get token, exiting...");

	if (!(await connectToDatabase(client))) {
		Log.error("Failed to connect to database, exiting...");
		return;
	}

	client.once("ready", async () => {
		Log.info(`Logged into client`);

		client.eventsToStartAfterReady = [];
		client.userReplyCache = new Collection();

		if (await devModeEnabled(client)) {
			client.user?.setPresence({
				activities: [
					{ type: ActivityType.Playing, name: `with some code` },
				],
				status: "dnd",
			});
		} else {
			client.user?.setPresence({
				activities: [
					{
						type: ActivityType.Watching,
						name: `for Boston references.`,
					},
				],
				status: "online",
			});
		}

		loadPackages(client);
		Log.info("Registered all packages");

		if (await registerEvents(client, "events")) {
			Log.info("Registered events");
		} else {
			Log.error("Failed to register events");
		}

		if (registerTasks(client, "tasks")) {
			Log.info("Registered tasks");
		} else {
			Log.error("Failed to register tasks");
		}

		if (
			await registerTextCommands({
				client: client,
				commandsFolder: "commands/text",
				token: token,
				debug: isTestBot(client),
			})
		) {
			Log.info("Registered text commands");
		} else {
			Log.error("Failed to register text commands");
		}

		if (!isTestBot(client) || !getConfig().testingSlashCommandsDisabled) {
			if (
				await registerSlashCommands({
					client,
					commandsFolder: "commands/slash",
					token: token,
				})
			) {
				Log.info("Registered slash commands");
			} else {
				Log.error("Failed to register slash commands");
			}
		}

		if (client.tasksToStartAfterReady) {
			client.tasksToStartAfterReady.forEach((task) => {
				if (task.runOnLoad) {
					task.execute(client);
				}
				setInterval(() => {
					task.execute(client);
				}, task.time);
			});
		}
		Log.info(`[Started] | All tasks`);

		if (client.eventsToStartAfterReady) {
			Log.debug(
				`${client.eventsToStartAfterReady.length} events to start`
			);
			client.eventsToStartAfterReady.forEach((event) => {
				if (event.once) {
					client.once(event.name, (...args) =>
						event.execute(client, ...args)
					);
				} else {
					client.on(event.name, (...args) =>
						event.execute(client, ...args)
					);
				}
			});
		}
		Log.info(`[Started] | All events`);

		Log.info(
			`${client.user?.username} has successfully started on cluter ${client.cluster.id}`
		);
		Log.info(`Cluster ${client.cluster.id} successfully started`);
	});

	client.login(token);

	client.on("error", (error) => handleError(error));
})();
