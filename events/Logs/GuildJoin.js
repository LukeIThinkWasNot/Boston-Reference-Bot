const { generateEmbed } = require("../../utils/embeds/embed-utils");
const {
	unixToDiscordTimestamp,
	getUnixTimeSeconds,
} = require("../../utils/time-utils");
const { getConfig, getChannelFromGuild } = require("../../utils/utils");

const event = {
	name: "guildCreate",
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

		let guildOwner = await client.users.fetch(guild.ownerId);

		const joinEmbed = await generateEmbed(
			{
				timestamp: true,
			},
			{
				author: {
					name: guild.name,
					iconURL: guild.iconURL() || undefined,
				},
				thumbnail: guild.iconURL(),
				description: `> **Guild Name:** ${guild.name} (${guild.id})\n> **Owner:** ${guildOwner.username} (${guildOwner.id})\n> **Member Count:** ${guild.memberCount}\n> **Created:** ${unixToDiscordTimestamp("WeekdayDateTime", getUnixTimeSeconds())}\n> **Boosts:** ${guild.premiumSubscriptionCount || 0}\n> **Boost Level:** ${guild.premiumTier}\n> **Verification level:** ${guild.verificationLevel}`,
			}
		);

		await logChannel.send({
			content: `${getConfig().emojis.rightGreenArrow} I have been added to \`${guild.name}\` and I am now up to \`~${client.guilds.cache.size}\` servers.`,
			embeds: [joinEmbed],
		});
	},
};

module.exports = event;
