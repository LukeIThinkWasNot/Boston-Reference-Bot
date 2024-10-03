const { generateEmbed } = require("../../../utils/embeds/embed-utils");
const { getSystemInfo } = require("../../../utils/utils");

const command = {
	command: "devinfo",
	devOnly: true,
	description: "The bot's server stats",
	commandCategory: "Developer",
	cooldown: 3,
	callback: async (client, message, args) => {
		const reply = message.channel.send({ content: "Fetching stats..." });

		const info = await getSystemInfo();

		const embed = await generateEmbed(
			{
				guild: message.guild,
			},
			{
				author: {
					name: `${client.user?.username} Stats`,
					iconURL: client.user?.displayAvatarURL() || undefined,
				},
				fields: [
					{
						name: "CPU",
						value: `Brand: ${info.cpu.brand}\nManufacturer: ${info.cpu.manufacturer}\nSpeed: ${info.cpu.speed} GHz\nCores: ${info.cpu.cores}`,
						inline: true,
					},
					{
						name: "RAM",
						value: `Total: ${info.ram.total}\nActive: ${info.ram.active}`,
						inline: true,
					},
					{
						name: "OS",
						value: `Platform: ${info.os.platform}\nDistro: ${info.os.distro}\nRelease: ${info.os.release}`,
						inline: true,
					},
					{
						name: "Disk",
						value: `Manufacturer: ${info.disk.manufacturer}\nModel: ${info.disk.model}\nSize: ${info.disk.size}`,
						inline: true,
					},
				],
			}
		);

		(await reply).edit({ embeds: [embed], content: "" });
	},
};

module.exports = command;
