const { getConfig, getChannelFromGuild } = require("../../utils/utils");

const event = {
	name: "guildDelete",
	once: false,
	ignoreUntilStart: true,
	async execute(client, guild) {
		const supportGuildId = getConfig().supportServer.guildId;
		const supportLogChannelId =
			getConfig().supportServer.botEventLogsChannelId;

		const logChannel = await getChannelFromGuild(
			client,
			supportGuildId,
			supportLogChannelId
		);
		if (!logChannel || !("send" in logChannel)) return;

		await logChannel.send({
			content: `${getConfig().emojis.leftRedArrow} I have been removed from \`${guild.name}\` and I am now down to \`~${client.guilds.cache.size}\` servers.`,
		});
	},
};

module.exports = event;
