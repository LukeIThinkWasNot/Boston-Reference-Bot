const { PermissionsBitField } = require("discord.js");
const Log = require("../../utils/log");
const {
	getConfig,
	isDev,
	getCallerInfoFormatted,
} = require("../../utils/utils");
const {
	CustomEmbedType,
	replyToCommand,
	generateEmbed,
} = require("../../utils/embeds/embed-utils");

const cooldowns = new Map();
const event = {
	name: "messageCreate",
	once: false,
	ignoreUntilStart: true,
	async execute(client, message) {
		let prefix = getConfig().devPrefix;

		let cmdExecuted = "N/A";
		try {
			if (!message.guild || !message.inGuild) return;
			if (
				!message.guild.members.me?.permissions.has([
					PermissionsBitField.Flags.SendMessages,
					PermissionsBitField.Flags.EmbedLinks,
				])
			)
				return;
			if (
				!message.channel
					.permissionsFor(message.guild.members.me)
					?.has([
						PermissionsBitField.Flags.SendMessages,
						PermissionsBitField.Flags.EmbedLinks,
					])
			)
				return;

			const args = message.content.split(/[ ]+/);
			let name2 = args.slice(0, 2).join("").toLowerCase();
			let name = args.shift().toLowerCase();

			if (name2.startsWith(`<@${client.user.id}>`)) {
				args.shift();
				name = name2;
			}

			if (name.trim().toLowerCase() === `<@${client.user.id}>`) return;

			if (
				!name.startsWith(prefix) &&
				!name.startsWith(`<@${client.user.id}>`)
			)
				return;

			const commandName = name
				.replace(prefix, "")
				.replace(`<@${client.user.id}>`, "");

			let command =
				client.textcommands.get(commandName) ||
				client.textcommands.get(
					client.textcommandalias.get(commandName)
				);
			if (!command) return;

			cmdExecuted = commandName;

			if (message.content.startsWith(`<@${client.user.id}>`)) {
				message.content = message.content
					.replace(`<@${client.user.id}>`, ``)
					.trim();

				if (message.mentions?.users.first() === client.user) {
					let isFirst = true;
					message.mentions.users = message.mentions.users.filter(
						(user) => {
							if (user === client.user && isFirst) {
								isFirst = false;
								return false;
							}
							return true;
						}
					);
				}
			}

			let {
				minArgs = 0,
				maxArgs = null,
				expectedArgs = "",
				cooldown = 5,
				devOnly = false,
				botPermissions = [],
				userPermissions = [],
				callback,
			} = command;

			const maintenance = client.maintenance;

			if (maintenance) {
				if (maintenance.maintenance == true) {
					if (!isDev(message.author.id)) {
						replyToCommand(message, {
							embeds: [
								await generateEmbed(
									{
										orgMessage: message,
										embedType: CustomEmbedType.error,
										replyToMessage: true,
										deleteMsg: true,
										emoji: true,
									},
									{
										description: `PSRP Utilities is currently under maintenance!\n**__Details:__** ${maintenance.maintenanceDetails}`,
									}
								),
							],
						});
						return;
					}
				}
			}

			if (devOnly && !isDev(message.author.id)) {
				await message.reply({
					content:
						"Now just who do you think you are running a dev command?",
				});
				return;
			}

			if (botPermissions.length > 0) {
				let missingPerm = false;

				for (let perm of botPermissions) {
					if (
						!message.guild?.members?.me?.permissions.has(perm, true)
					) {
						missingPerm = true;
					}

					if (
						!message.channel
							.permissionsFor(message.guild?.members.me)
							?.has(perm, true)
					) {
						missingPerm = true;
					}
				}

				if (missingPerm) {
					message.channel.send({
						content: `I am missing the permissions to run this command :(`,
					});
					return;
				}
			}

			if (userPermissions.length > 0 && !isDev(message.author.id)) {
				let missingPerm = true;

				for (let perm of userPermissions) {
					if (message.member?.permissions.has(perm, true)) {
						missingPerm = false;
					}

					if (
						message.channel
							.permissionsFor(message.member)
							?.has(perm, true)
					) {
						missingPerm = false;
					}
				}

				if (missingPerm) {
					replyToCommand(message, {
						embeds: [
							await generateEmbed(
								{
									orgMessage: message,
									embedType: CustomEmbedType.error,
									replyToMessage: true,
									deleteMsg: true,
									emoji: true,
								},
								{
									description: `You do not have the correct permissions required to run this command.`,
								}
							),
						],
					});
					return;
				}
			}

			if (
				args.length < minArgs ||
				(maxArgs !== null && args.length > maxArgs)
			) {
				// sendEmbed(
				// 	message.channel,
				// 	{
				// 		embedType: CustomEmbedType.error,
				// 		emoji: true,
				// 		replyToMessage: true,
				// 	},
				// 	{
				// 		description: `Invalid command usage\n\`${name} ${expectedArgs}\``,
				// 	}
				// );
				replyToCommand(message, {
					embeds: [
						await generateEmbed(
							{
								orgMessage: message,
								embedType: CustomEmbedType.error,
								replyToMessage: true,
								deleteMsg: true,
								emoji: true,
							},
							{
								description: `Invalid command usage\nUsage: \`${name} ${expectedArgs}\``,
							}
						),
					],
				});
				return;
			}

			if (cooldown > 0) {
				let userId = message.author.id;

				if (!cooldowns.has(commandName)) {
					cooldowns.set(commandName, new Map());
				}

				const now = Math.floor(Date.now() / 1000);
				const timestamps = cooldowns.get(commandName);
				if (timestamps.get(userId)) {
					let remainingTime = timestamps.get(userId) + cooldown - now;

					if (remainingTime > 0) {
						replyToCommand(message, {
							embeds: [
								generateEmbed(
									{
										embedType: CustomEmbedType.error,
										deleteMsg: true,
										replyToMessage: true,
										deleteTime: 1000,
										emoji: true,
									},
									{
										description: `You are on cooldown! Consider buying premium to lower cooldowns :) All Time Master commands will remain free.\n**__Time remaining:__** ${remainingTime} seconds`,
									}
								),
							],
						});
						return;
					} else {
						timestamps.set(userId, now);
					}
				} else {
					timestamps.set(userId, now);
				}
			}

			await callback(client, message, args, args.join(" "));
		} catch (err) {
			if (
				message.guild?.members.me?.permissions.has(
					PermissionsBitField.Flags.SendMessages
				)
			) {
				Log.error(
					`[MAJOR] An error occurred in guild ${message.guild?.name} while executing command ${cmdExecuted} by user ${message.author.username} (${message.author.id}) | ${getCallerInfoFormatted()} | ${err}`
				);
				replyToCommand(message, {
					embeds: [
						await generateEmbed(
							{
								orgMessage: message,
								embedType: CustomEmbedType.error,
								replyToMessage: true,
								deleteMsg: true,
								emoji: true,
							},
							{
								description: `There was an error executing this command! Please try again later or contact support if this issue persists.`,
							}
						),
					],
				});
				// sendBotError(
				// 	{
				// 		title: `No permissions`,
				// 		description: `An error occurred in guild ${message.guild?.name} | ${getCallerInfoFormatted()} | ${err}`,
				// 	},
				// 	true
				// );
				// return;
			}
		}
	},
};

module.exports = event;
