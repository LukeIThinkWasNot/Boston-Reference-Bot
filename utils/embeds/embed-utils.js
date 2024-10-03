const {
	InteractionResponse,
	ChatInputCommandInteraction,
	ButtonInteraction,
	TextChannel,
	EmbedBuilder,
	ButtonBuilder,
	Message,
	ActionRowBuilder,
} = require("discord.js");
const Log = require("../log");
const {
	getCallerInfoFormatted,
	stringWithNoTabs,
	getConfig,
} = require("../utils");

/**
 * @typedef {Object} SendEmbedSettings
 * @property {string} [messageContent]
 * @property {Message | ChatInputCommandInteraction} [orgMessage]
 * @property {boolean} [replyToMessage]
 * @property {boolean} [deleteMsg]
 * @property {number} [deleteTime]
 * @property {boolean} [ephemeral]
 * @property {boolean} [emoji]
 * @property {CustomEmbedType} [embedType]
 * @property {Guild | null} [guild]
 */

/**
 * @typedef {Object} EmbedArgs
 * @property {string | null | undefined} [description]
 * @property {EmbedAuthorData | null} [author]
 * @property {string | null} [title]
 * @property {string | null} [url]
 * @property {APIEmbedField[] | APIEmbedField | null} [fields]
 * @property {string | null} [image]
 * @property {string | null} [thumbnail]
 * @property {EmbedFooterOptions | null} [footer]
 * @property {ColorResolvable | null} [color]
 * @property {number | Date | null | undefined} [timestamp]
 */

const CustomEmbedType = {
	IGNORE: "__IGNORE__",
	error: "error",
	success: "success",
	alert: "alert",
	information: "information",
};

function getEmojiConversion() {
	const config = getConfig();
	return {
		[CustomEmbedType.success]: config.emojis.checkMark,
		[CustomEmbedType.error]: config.emojis.crossMark,
		[CustomEmbedType.information]: config.emojis.info,
		[CustomEmbedType.alert]: config.emojis.alert,
	};
}

function getCustomEmbedTypeColor(embedType, guild) {
	return new Promise((resolve) => {
		switch (embedType) {
			case CustomEmbedType.success:
				resolve("00ff00");
				break;
			case CustomEmbedType.error:
				resolve("ff0000");
				break;
			case CustomEmbedType.alert:
				resolve("feda26");
				break;
			case CustomEmbedType.information:
				resolve("1cb1f2");
				break;
			default:
				if (guild) {
					resolve(getEmbedColor(guild));
				} else {
					resolve(null);
				}
				break;
		}
	});
}

async function getEmbedColor() {
	return getConfig().defaultEmbedColor;
}

// /**
//  * Sends an embed message.
//  *
//  * @param {ChatInputCommandInteraction | Channel} toSend - The interaction or channel to send the message to.
//  * @param {SendEmbedSettings} settings - Settings for sending the embed.
//  * @param {EmbedArgs} args - Arguments for generating the embed.
//  * @returns {Promise<Message<boolean> | InteractionResponse<boolean> | null | undefined>}
//  */
// function sendEmbed(toSend, settings, args) {
// 	return sendEmbedWithEmbed(toSend, settings, generateEmbed(settings, args));
// }

/**
 * Sends an embed message with another embed.
 *
 * @param {ChatInputCommandInteraction | Channel} toSend - The interaction or channel to send the message to.
 * @param {SendEmbedSettings} settings - Settings for sending the embed.
 * @param {EmbedArgs} args - Arguments for generating the embed.
 * @returns {Promise<void>}
 */
async function sendEmbedWithEmbed(toSend, settings, embed) {
	let newMSG;

	if (toSend instanceof ChatInputCommandInteraction) {
		newMSG = await toSend.reply({
			content: settings.messageContent,
			embeds: [embed],
			ephemeral: settings?.ephemeral,
		});

		if (!settings.deleteMsg) return newMSG;
	} else if (toSend instanceof TextChannel) {
		if (settings.replyToMessage && settings.orgMessage) {
			newMSG = await settings.orgMessage.reply({
				content: settings.messageContent,
				embeds: [embed],
			});
		} else {
			newMSG = await toSend.send({
				content: settings.messageContent,
				embeds: [embed],
			});
		}

		if (!settings.deleteMsg) return newMSG;
	}

	if (settings.deleteMsg) {
		setTimeout(() => {
			try {
				newMSG.delete();
				if (settings.orgMessage) {
					settings.orgMessage.delete();
				}
			} catch (err) {
				Log.error(
					`[Minor] Failed to delete message | ${getCallerInfoFormatted(
						1
					)} | ${err}`
				);
			}
		}, settings.deleteTime || 5000);
	}
}

/**
 * Settings for customizing the embed and message options.
 * @typedef {Object} generateEmbedArgs
 * @property {boolean} [noEmbedColor] - Whether to disable embed colors.
 * @property {boolean} [timestamp] - Whether to include a timestamp in the embed.
 * @property {CustomEmbedType} [embedType] - The type of custom embed to use.
 * @property {boolean} [emoji] - Whether to include emojis in the message.
 * @property {Guild | null} [guild] - The guild context for the message, or null if none.
 * @property {boolean} [allowTabs] - Whether to allow tab characters in the message content.
 */

/**
 * Sends an embed message with another embed.
 *
 * @param {generateEmbedArgs} settings - Settings for sending the embed.
 * @param {EmbedArgs} embedArgs - Arguments for generating the embed.
 * @returns {Promise<void>}
 */
async function generateEmbed(settings, embedArgs) {
	const embed = new EmbedBuilder()
		.setAuthor(embedArgs.author || null)
		.setTitle(embedArgs.title || null)
		.setImage(embedArgs.image || null)
		.setURL(embedArgs.url || null)
		.setThumbnail(embedArgs.thumbnail || null)
		.setTimestamp(embedArgs.timestamp || null)
		.setFooter(embedArgs.footer || null)
		.setColor(
			embedArgs.color ||
				(await getCustomEmbedTypeColor(
					settings?.embedType,
					settings?.guild
				))
		);

	if (embedArgs.fields && embedArgs.fields.length > 0) {
		embed.addFields(...embedArgs.fields);
	}

	if (settings.noEmbedColor) {
		embed.setColor(null);
	}

	if (settings && settings.timestamp) {
		embed.setTimestamp();
	}

	let description = embedArgs.description
		? `${
				settings?.emoji && settings?.embedType
					? getEmojiConversion()[settings.embedType]
					: ""
			} ${embedArgs.description}`
		: null;

	if (description) {
		description = !settings.allowTabs
			? stringWithNoTabs(description)
			: description;

		embed.setDescription(description);
	}

	return embed;
}

/**
 * @typedef {Object} buttonSettings
 * @property {string} [label] - The label for the button.
 * @property {string} [customId] - The custom ID for the button.
 * @property {string} [url] - The URL for the button.
 * @property {ComponentEmojiResolvable} [emoji] - The emoji for the button.
 * @property {ButtonStyle} [style] - The style for the button.
 * @property {boolean} [disabled] - Whether the button is disabled.
 */

/**
 * Generates a button.
 * @param {buttonSettings} buttonArgs - The settings for the button.
 * @throws {Error} - If the button is missing a custom ID or URL.
 * @returns {ButtonBuilder}
 */
function generateButton(buttonArgs) {
	let buttonBuilder = new ButtonBuilder();

	if (!buttonArgs.customId && !buttonArgs.url) {
		throw new Error("Buttons must have a customid or url!");
	}

	if (!buttonArgs.label && !buttonArgs.emoji) {
		throw new Error("Buttons must have a label or emoji!");
	}

	if (buttonArgs.label) buttonBuilder.setLabel(buttonArgs.label);
	if (buttonArgs.customId) buttonBuilder.setCustomId(buttonArgs.customId);
	if (buttonArgs.url) buttonBuilder.setURL(buttonArgs.url);
	if (buttonArgs.style) buttonBuilder.setStyle(buttonArgs.style);
	if (buttonArgs.emoji) buttonBuilder.setEmoji(buttonArgs.emoji);
	if (buttonArgs.disabled) buttonBuilder.setDisabled(buttonArgs.disabled);

	return buttonBuilder;
}

/**
 * Generates a button row builder.
 * @param {buttonSettings} buttonArgs - The settings for the button.
 * @throws {Error} - If the button is missing a custom ID or URL.
 * @returns {ActionRowBuilder<ButtonBuilder>}
 */
function generateButtonRow(buttonArgs) {
	return new ActionRowBuilder().addComponents(generateButton(buttonArgs));
}

/**
 * Generates multiple buttons in a row builder.
 * @param {buttonSettings[]} buttonArgs - The settings for the button.
 * @throws {Error} - If the button is missing a custom ID or URL.
 * @returns {ActionRowBuilder<ButtonBuilder>[]}
 */
function generateButtonsRow(buttonArgs) {
	let row = new ActionRowBuilder();

	buttonArgs.forEach((btn) => {
		row.addComponents(generateButton(btn));
	});

	return row;
}

/**
 * Options for sending a message or interaction response.
 * @typedef {Object} SendMessageOptions
 * @property {textChannel} [channelToSend] - The text channel to send the message to.
 * @property {boolean} [ephemeral] - Whether the message should be ephemeral (only visible to the user).
 * @property {Message | InteractionResponse | ChatInputCommandInteraction} [edit] - Message or interaction response to edit.
 * @property {boolean} [reply] - Whether to reply to a message or interaction.
 * @property {boolean} [followUp] - Whether this is a follow-up message or interaction.
 * @property {boolean} [noReplyFix] - Whether to avoid fixing the reply interaction behavior.
 * @property {"Message" | "Slash" | "Both"} [delete] - Specifies what to delete ("Message", "Slash", or "Both").
 * @property {boolean} [deleteOriginal] - Whether to delete the original message or interaction response.
 * @property {number} [deleteTime] - Time in milliseconds after which to delete the message or interaction response.
 * @property {EmbedBuilder[]} [embeds] - Array of embeds to include in the message.
 * @property {(APIActionRowComponent<APIMessageActionRowComponent> | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>)[]} [components] - Components to include in the message.
 * @property {(Attachment | MessageEditAttachmentData)[]} [attachments] - Array of attachments to include in the message.
 * @property {string} [content] - The content of the message.
 */

/**
 * Sends the same embedded message on commands AND interactions
 *
 * @param {ChatInputCommandInteraction | Channel} toSend - The interaction or channel to send the message to.
 * @param {SendMessageOptions} settings - Settings for sending the embed.
 * @returns {Promise<void>}
 */
async function replyToCommand(message, settings) {
	let newMSG;
	if (message instanceof InteractionResponse) {
		message = await message.fetch();
	}

	if (settings.edit) {
		if (
			settings.edit instanceof ChatInputCommandInteraction ||
			settings.edit instanceof ButtonInteraction
		) {
			newMSG = await settings.edit.editReply({
				content: settings.content,
				components: settings.components,
				embeds: settings.embeds,
				attachments: settings.attachments,
			});
		} else {
			newMSG = await settings.edit.edit({
				content: settings.content,
				embeds: settings.embeds,
				attachments: settings.attachments,
				components: settings.components,
			});
		}
	} else if (
		settings.followUp &&
		(message instanceof ChatInputCommandInteraction ||
			message instanceof ButtonInteraction) &&
		(message.replied || message.deferred)
	) {
		newMSG = await message.followUp({
			content: settings.content,
			components: settings.components,
			ephemeral: settings.ephemeral,
			embeds: settings.embeds,
		});
	} else if (settings.reply) {
		if (
			(message instanceof ChatInputCommandInteraction ||
				message instanceof ButtonInteraction) &&
			(message.replied || message.deferred)
		) {
			if (message.replied || message.deferred) {
				newMSG = await message.editReply({
					content: settings.content,
					embeds: settings.embeds,
					components: settings.components,
				});
			} else {
				newMSG = await message.reply({
					content: settings.content,
					embeds: settings.embeds,
					ephemeral: settings.ephemeral,
					components: settings.components,
				});
			}
		} else if (message instanceof ButtonInteraction) {
			if (message.replied || message.deferred) {
				newMSG = await message.editReply({
					content: settings.content,
					embeds: settings.embeds,
					components: settings.components,
				});
			} else {
				newMSG = await message.reply({
					content: settings.content,
					embeds: settings.embeds,
					ephemeral: settings.ephemeral,
					components: settings.components,
				});
			}
		} else {
			newMSG = await message.reply({
				content: settings.content,
				ephemeral: settings.ephemeral,
				embeds: settings.embeds,
				components: settings.components,
			});
		}
	} else if (settings.channelToSend) {
		newMSG = await settings.channelToSend.send({
			content: settings.content,
			embeds: settings.embeds,
			components: settings.components,
		});
		if (
			message instanceof ChatInputCommandInteraction &&
			settings.noReplyFix
		) {
			try {
				await message.deferReply();
			} catch (err) {
				Log.error(
					`[Minor] Failed to defer reply | ${getCallerInfoFormatted()} | ${err}`
				);
			}
			try {
				await message.deleteReply();
			} catch (err) {
				Log.error(
					`[Minor] Failed to delete reply | ${getCallerInfoFormatted()} | ${err}`
				);
			}
		}
	} else {
		if (
			message instanceof ChatInputCommandInteraction ||
			message instanceof ButtonInteraction
		) {
			if (message.replied || message.deferred) {
				newMSG = await message.editReply({
					content: settings.content,
					embeds: settings.embeds,
					components: settings.components,
				});
			} else {
				newMSG = await message.reply({
					content: settings.content,
					embeds: settings.embeds,
					ephemeral: settings.ephemeral,
					components: settings.components,
				});
			}
		} else {
			newMSG = await message.channel.send({
				content: settings.content,
				components: settings.components,
				embeds: settings.embeds,
			});
		}
	}

	if (settings.delete) {
		setTimeout(() => {
			try {
				if (settings.deleteOriginal && message instanceof Message) {
					message.delete();
				}

				if (
					(settings.delete === "Message" ||
						settings.delete === "Both") &&
					message instanceof Message
				) {
					newMSG.delete();
				}
				if (
					(settings.delete === "Slash" ||
						settings.delete === "Both") &&
					(message instanceof ChatInputCommandInteraction ||
						message instanceof ButtonInteraction)
				) {
					message.deleteReply();
				}
			} catch (err) {
				Log.error(
					`[Minor] Failed to delete message | ${getCallerInfoFormatted()} | ${getCallerInfoFormatted(1)} | ${err}`
				);
			}
		}, settings.deleteTime || 5000);
	}

	return newMSG;
}

module.exports = {
	CustomEmbedType,
	getEmojiConversion,
	getCustomEmbedTypeColor,
	getEmbedColor,
	// sendEmbed,
	sendEmbedWithEmbed,
	generateEmbed,
	generateButton,
	generateButtonRow,
	generateButtonsRow,
	// sendArgsErrorEmbed,
	replyToCommand,
};
