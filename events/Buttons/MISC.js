const { generateEmbed } = require("../../utils/embeds/embed-utils");

const event = {
	name: "interactionCreate",
	// once: false,
	ignoreUntilStart: true,
	async execute(client, interaction) {
		if (!interaction.isButton()) return;

		const id = interaction.customId;
		if (id.includes("extra::")) {
			interaction.reply({
				ephemeral: true,
				embeds: [
					await generateEmbed(
						{},
						{
							author: {
								name: "Extra info",
								iconURL:
									client.user?.displayAvatarURL() ||
									undefined,
							},
							fields: [
								{
									name: "Commands",
									value: `Slash Commands: ${client.slashcommands ? client.slashcommands.size : "0"}\nText Commands: ${client.textcommands ? client.textcommands.size : "0"}`,
								},
								{
									name: "Packages",
									value: client.packages
										? client.packages
												.map(
													(v) =>
														`${v.name}: ${v.version}`
												)
												.join("\n")
										: "N/A",
								},
							],
						}
					),
				],
			});
		}
	},
};

module.exports = event;
