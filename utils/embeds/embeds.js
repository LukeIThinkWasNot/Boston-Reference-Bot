/**
 * @typedef userSettings
 * @property {boolean | null} [replyEnabled] - Whether the bot should reply to messages
 * @property {string | null} [escapeCharacters] - The characters for the bot to look for when you want the bot to reply with time
 * @property {string | null} [timezone] - The timezone of the user
 * @property {string | null} [timezoneOffset] - The offset of the user's timezone
 */

const { ButtonStyle } = require("discord.js");
const { generateButtonsRow, generateEmbed } = require("./embed-utils");

/**
 * Generates the user settings components
 * @param {ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction} interaction
 * @param {userSettings} componentSettings
 */
function usersettingsComponents(interaction, componentSettings) {
	const btnRow = generateButtonsRow([
		{
			label: "Reply to messages",
			style: componentSettings.replyEnabled
				? ButtonStyle.Success
				: ButtonStyle.Danger,
			customId: `TReply::${interaction.user.id}::${componentSettings.replyEnabled ? "true" : "false"}`,
		},
	]);
	return [btnRow];
}

/**
 * Generates the user settings embed
 * @param {ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction} interaction
 * @param {userSettings} usersettings
 */
async function usersettingsEmbed(interaction, usersettings) {
	return await generateEmbed(
		{
			timestamp: true,
		},
		{
			author: {
				name: interaction.user.username || "N/A",
				iconURL: interaction.user.displayAvatarURL() || undefined,
			},
			title: "Personal settings",
			description: "You can edit your personal settings below.",
			fields: [
				{
					name: "Buttons",
					value: `**Reply with ye references:**
						Type: Toggle
						Current value: ${usersettings.replyEnabled || "false"}
						Description: Rather the bot should reply to Boston references (I.e smokin').`,
				},
			],
		}
	);
}

module.exports = {
	usersettingsComponents,
	usersettingsEmbed,
};
