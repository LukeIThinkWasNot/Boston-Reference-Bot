const { SlashCommandBuilder, ButtonStyle } = require("discord.js");
const { getConfig, getClientUptime } = require("../../utils/utils");
const {
	generateButtonsRow,
	generateEmbed,
	replyToCommand,
} = require("../../utils/embeds/embed-utils");

const command = {
	data: new SlashCommandBuilder()
		.setName("botinfo")
		.setDescription("Get information about boston reference."),
	async execute(interaction, client) {
		const users = client.users.cache.size;
		const servers = client.guilds.cache.size;

		const btnRow = generateButtonsRow([
			{
				label: "Invite Me",
				style: ButtonStyle.Link,
				url: `https://discord.com/oauth2/authorize?client_id=${getConfig().botId}&permissions=8&integration_type=0&scope=bot+applications.commands`,
			},
			{
				label: "Extra",
				style: ButtonStyle.Primary,
				customId: `extra::${interaction.user.id}`,
			},
		]);

		const embed = await generateEmbed(
			{
				timestamp: true,
			},
			{
				author: {
					name: client.user?.username || "N/A",
					iconURL: client.user?.displayAvatarURL() || undefined,
				},
				fields: [
					{
						name: "About",
						value: "Time master is a bot all about time. The bot provides every time related command Luke (the bot's dev) could think of!",
						inline: false,
					},
					{
						name: "Developers",
						value: "[@LukeIThink](https://discord.com/users/296823576156307467)",
						inline: false,
					},
					{
						name: "Bot information",
						value: `Prefix: /\nCounts: ${users} users | ${servers} servers\nVersion: ${getConfig().version}\nUptime: ${getClientUptime(client)}`,
					},
				],
				footer: {
					text: `Shard: ${client.cluster.id} | Development`,
				},
			}
		);

		await replyToCommand(interaction, {
			embeds: [embed],
			components: [btnRow],
		});
	},
	commandType: "ChatInput",
};

module.exports = command;
