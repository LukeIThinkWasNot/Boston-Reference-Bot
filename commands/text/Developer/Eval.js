const { generateEmbed } = require("../../../utils/embeds/embed-utils");
const { truncateMessage } = require("../../../utils/utils");

const command = {
	command: "eval",
	description: "Developer command to execute any and all code",
	expectedArgs: "(code)",
	commandCategory: "Developer",
	minArgs: 1,
	devOnly: true,
	callback: async (client, message, args) => {
		let code = args.join(" ");
		let output;
		let isErr = false;

		try {
			output = await eval(code);
		} catch (err) {
			output = err.toString();
			isErr = true;
		}

		let outputMessage = truncateMessage(
			2000,
			output?.toString() || String(output)
		);
		if (outputMessage.trim() === "") {
			outputMessage = "No output";
		}

		await message.channel.send({
			embeds: [
				await generateEmbed(
					{
						timestamp: true,
						allowTabs: false,
						noEmbedColor: true,
					},
					{
						title: "Eval",
						description: "Executed code",
						fields: [
							{
								name: "Input",
								value: `\`\`\`js\n${truncateMessage(2000, code)}\n\`\`\``,
							},
							{
								name: "Output",
								value: `\`\`\`js\n"Output:" ${outputMessage}\n\`\`\``,
							},
						],
						color: isErr ? "#ff0000" : "#00ff00",
					}
				),
			],
		});
	},
};

module.exports = command;
