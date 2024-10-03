const { SlashCommandBuilder } = require("discord.js");
const {
	replyToCommand,
	generateEmbed,
} = require("../../utils/embeds/embed-utils");
const { getDatabasePing } = require("../../utils/utils");

const command = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Get the bot's ping."),
	async execute(interaction, client) {
		await interaction.deferReply();

		const reply = await interaction.fetchReply();
		const ping = reply.createdTimestamp - interaction.createdTimestamp;
		replyToCommand(interaction, {
			embeds: [
				await generateEmbed(
					{},
					{
						title: "Pong!",
						description: `**Bot latency:** ${ping}ms\n**API latency:** ${Math.round(client.ws.ping)}ms\n**MongoDB Latency:** ${Math.round(await getDatabasePing(client))}ms`,
						footer: {
							text: client.user?.username || "N/A",
							iconURL:
								client.user?.displayAvatarURL() || undefined,
						},
					}
				),
			],
		});
	},
	commandType: "ChatInput",
};

module.exports = command;
