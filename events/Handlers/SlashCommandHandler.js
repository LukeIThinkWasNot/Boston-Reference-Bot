const { PermissionsBitField } = require("discord.js");
const {
	CustomEmbedType,
	generateEmbed,
} = require("../../utils/embeds/embed-utils");
const Log = require("../../utils/log");
const { isTestBot, isDev } = require("../../utils/utils");

const event = {
	name: "interactionCreate",
	once: false,
	ignoreUntilStart: true,
	async execute(client, interaction) {
		if (!interaction || !interaction.isChatInputCommand()) return;
		const command = client.slashcommands.get(interaction.commandName);

		if (!command) return;

		try {
			if (
				!interaction.guild?.members.me?.permissions.has([
					PermissionsBitField.Flags.SendMessages,
					PermissionsBitField.Flags.EmbedLinks,
				])
			)
				return;

			if (interaction.replied) return;

			if (command.disabled) {
				return interaction.reply({
					ephemeral: true,
					embeds: [
						await generateEmbed(
							{ embedType: CustomEmbedType.error, emoji: true },
							{
								title: "Disabled",
								description: "This command is disabled.",
							}
						),
					],
				});
			}

			const maintenance = client.maintenance;

			if (
				interaction.member &&
				maintenance &&
				maintenance.maintenance &&
				!isDev(interaction.user.id)
			) {
				if (!isDev(interaction.user.id)) {
					return interaction.reply({
						ephemeral: true,
						embeds: [
							await generateEmbed(
								{
									embedType: CustomEmbedType.error,
									emoji: true,
								},
								{
									title: "Maintenance",
									description: `PSRP Utilities is currently under maintenance!`,
									fields: [
										{
											name: "Details",
											value: `${maintenance.maintenanceDetails || "No details provided."}`,
										},
									],
								}
							),
						],
					});
				}
			}

			if (isTestBot(client) && !isDev(interaction.user.id)) {
				interaction.reply({
					ephemeral: true,
					embeds: [
						await generateEmbed(
							{ embedType: CustomEmbedType.error, emoji: true },
							{
								title: "Wrong bot",
								description: `You are not allowed to use the beta bot!`,
							}
						),
					],
				});
				return;
			}

			if (
				command.devOnly &&
				interaction.member &&
				!isDev(interaction.user.id)
			) {
				interaction.reply({
					ephemeral: true,
					embeds: [
						await generateEmbed(
							{ embedType: CustomEmbedType.error, emoji: true },
							{
								title: "No permission",
								description: `You do not have permission to run this command!`,
							}
						),
					],
				});
				return;
			}

			await command.execute(interaction, client);
		} catch (error) {
			console.error(error);
			try {
				await interaction
					.reply({
						content:
							"There was an error while executing this command!",
						ephemeral: true,
					})
					.catch((err) =>
						Log.error(
							"An error occurred while running a command!\n\n" +
								err.message
						)
					);
			} catch (err) {
				Log.warn("ERROR TRYING AGAIN");
				await interaction
					.editReply({
						content:
							"There was an error while executing this command!",
					})
					.catch((err) =>
						Log.error(
							"An error occurred while running a command!\n\n" +
								err.message
						)
					);
			}
		}
	},
};

module.exports = event;
