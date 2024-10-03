const { generateEmbed } = require("../../../utils/embeds/embed-utils");

const command = {
	command: "leaveserver",
	description: "Developer command to see what servers the bot is in",
	expectedArgs: "(server id)",
	commandCategory: "Developer",
	minArgs: 1,
	maxArgs: 1,
	devOnly: true,
	callback: async (client, message, args) => {
		let server = args[0];
		if (!server || Number.isNaN(Number(server)))
			return message.channel.send("Please provide a valid server ID");

		const guild = await client.guilds.fetch(server);
		if (!guild)
			return message.channel.send(`Server \`${server}\` not found`);

		const owner = await guild.fetchOwner();
		let ownerName = owner?.user.username || "Username unknown";
		let ownerID = owner?.id || "ID unknown";
		await guild.leave();
		await message.channel.send({
			embeds: [
				await generateEmbed(
					{
						timestamp: true,
						allowTabs: false,
						noEmbedColor: true,
					},
					{
						title: "🌎 Left Server",
						description: `Successfully left ${guild.name}`,
						fields: [
							{
								name: "Server ID",
								value: guild.id,
							},
							{
								name: "Owner",
								value: `**${ownerName}** \`${ownerID}\``,
							},
							{
								name: "Member count",
								value: guild.memberCount.toString(),
							},
						],
					}
				),
			],
		});
	},
};

module.exports = command;
