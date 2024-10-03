const Maintenance = require("../../../schema/Maintenance");

const command = {
	command: "maintenance",
	description: "Toggle maintenance",
	commandCategory: "Developer",
	minArgs: 1,
	expectedArgs: "[Reason/Enable/Disable/Createfile] (Reason)",
	devOnly: true,
	callback: async (client, message, args) => {
		const maintenance = await Maintenance.findOne();

		switch (args[0].toLowerCase()) {
			case "reason": {
				if (!maintenance)
					return message.channel.send({
						content: "You must make a file!",
					});

				if (maintenance?.maintenance == false)
					return message.channel.send({
						content: "No maintenance enabled.",
					});
				if (!args[1])
					return message.channel.send({
						content: `Current maintenance reason: ${maintenance.maintenanceDetails}`,
					});

				let theReason = args.splice(1).join(" ");

				maintenance.maintenanceDetails = theReason;
				client.maintenance.maintenanceDetails = theReason;
				await maintenance.save();

				message.channel.send({
					content: `Current maintenance reason set to: \`${theReason}\``,
				});

				break;
			}
			case "enable": {
				if (!maintenance)
					return message.channel.send({
						content: "You must make a file!",
					});

				if (maintenance?.maintenance == true)
					return message.channel.send({
						content: "Maintenance is already enabled.",
					});
				let reason = args.splice(1).join(" ");
				if (!reason) reason = "Emergency maintenance.";

				maintenance.maintenance = true;
				maintenance.maintenanceDetails = reason;
				client.maintenance = maintenance;
				await maintenance.save();

				message.channel.send({
					content: `Enabled maintenance under the reason: \`${reason}\``,
				});

				break;
			}
			case "disable": {
				if (!maintenance)
					return message.channel.send({
						content: "You must make a file!",
					});

				if (maintenance?.maintenance == false)
					return message.channel.send({
						content: "Maintenance is already disabled.",
					});

				maintenance.maintenance = false;
				maintenance.maintenanceDetails = "None";
				client.maintenance = maintenance;
				await maintenance.save();

				message.channel.send({
					content: `Maintenance has been disabled.`,
				});

				break;
			}
			case "createfile": {
				if (maintenance)
					return message.channel.send({
						content: "File already exists.",
					});

				const newMaintenanceFile = new Maintenance({
					maintenance: false,
					maintenanceDetails: "None",
				});

				client.maintenance = newMaintenanceFile;

				newMaintenanceFile.save().catch((err) => console.error(err));

				message.channel.send({ content: "File created." });

				break;
			}
			default:
				message.channel.send({ content: "Invalid argument." });
		}
	},
};

module.exports = command;
