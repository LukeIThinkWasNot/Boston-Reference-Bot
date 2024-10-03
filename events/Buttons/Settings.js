const {
	generateEmbed,
	CustomEmbedType,
} = require("../../utils/embeds/embed-utils");
const Users = require("../../schema/Users");
const {
	usersettingsEmbed,
	usersettingsComponents,
} = require("../../utils/embeds/embeds");

const event = {
	name: "interactionCreate",
	// once: false,
	ignoreUntilStart: true,
	async execute(client, interaction) {
		if (interaction.isButton()) {
			const id = interaction.customId;
			if (id.includes("TReply")) {
				let enabled = id.includes("::true");
				const userId = interaction.customId.split("::")[1];

				if (interaction.user.id !== userId) {
					const embed = await generateEmbed(
						{
							embedType: CustomEmbedType.error,
						},
						{
							title: "Whoops!",
							description: `This is not your button!`,
						}
					);

					return interaction.reply({
						content: ``,
						embeds: [embed],
						components: [],
						ephemeral: true,
					});
				}

				await interaction.deferUpdate();

				let userData = await Users.findOne({
					userId: interaction.user.id,
				});

				if (!userData) {
					userData = await Users.create({
						userId: interaction.user.id,
					});
				}

				if (!enabled) {
					userData.replyEnabled = true;
					await userData.save();
				} else {
					userData.replyEnabled = false;
					await userData.save();
				}

				client.userReplyCache.set(
					interaction.user.id,
					userData.replyEnabled
				);

				interaction.editReply({
					embeds: [
						await usersettingsEmbed(interaction, {
							replyEnabled: userData.replyEnabled,
						}),
					],
					components: usersettingsComponents(interaction, {
						replyEnabled: userData.replyEnabled,
					}),
				});
			}
		}
	},
};

module.exports = event;
