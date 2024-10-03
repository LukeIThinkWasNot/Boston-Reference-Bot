const { SlashCommandBuilder } = require("discord.js");
const Users = require("../../schema/Users");
const {
	usersettingsEmbed,
	usersettingsComponents,
} = require("../../utils/embeds/embeds");

const command = {
	data: new SlashCommandBuilder()
		.setName("settings")
		.setDescription("Changes your personal settings."),
	async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true });

		let userData = await Users.findOne({
			userId: interaction.user.id,
		});

		if (!userData) {
			userData = await Users.create({
				userId: interaction.user.id,
			});
		}

		await interaction.editReply({
			embeds: [
				await usersettingsEmbed(interaction, {
					replyEnabled: userData.replyEnabled,
				}),
			],
			components: usersettingsComponents(interaction, {
				replyEnabled: userData.replyEnabled,
			}),
		});
	},
	commandType: "ChatInput",
};

module.exports = command;
