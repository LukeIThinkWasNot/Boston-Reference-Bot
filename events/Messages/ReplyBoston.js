const Users = require("../../schema/Users");
const { bostonSongs, randomBotMessages } = require("../../utils/variables");

function removeGrammar(str) {
	return str
		.replace("'", "")
		.replace("’", "")
		.replace(".", "")
		.replace(" ", "")
		.replace("&", "and")
		.replace(/<@!?[0-9]+>|<@&[0-9]+>/g, "");
}

const event = {
	name: "messageCreate",
	once: false,
	ignoreUntilStart: true,
	async execute(client, message) {
		if (message.author.bot) return;

		const msgContent = message.content.toLowerCase();

		const find = bostonSongs.filter((song) => {
			if (song.title.trim().toLowerCase() === "") return false;

			return removeGrammar(msgContent).includes(
				removeGrammar(song.title.toLowerCase())
			);
		});
		if (!find || find.length == 0) return;

		let song;

		// get random song from the array
		// if there are more than one song with the same title

		if (find.length > 1) {
			song = find[Math.floor(Math.random() * find.length)];
		} else {
			song = find[0];
		}

		// Grab random message from the array
		const randomMessage =
			randomBotMessages[
				Math.floor(Math.random() * randomBotMessages.length)
			];

		if (!song) return;

		if (client.userReplyCache.get(message.author.id) !== undefined) {
			if (client.userReplyCache.get(message.author.id) === false) {
				return;
			}
			message.reply(`${randomMessage}\n\n${song.url}`);
		} else {
			const data = await Users.findOne({ userId: message.author.id });

			if (!data) {
				client.userReplyCache.set(message.author.id, true);
				return;
			}

			if (data.replyEnabled === false) {
				client.userReplyCache.set(message.author.id, false);
				return;
			}

			if (data.replyEnabled === true) {
				client.userReplyCache.set(message.author.id, true);
				message.reply(`${randomMessage}\n\n${song.url}`);
			}
		}
	},
};

module.exports = event;
