const { ClusterManager, HeartbeatManager } = require("discord-hybrid-sharding");
const Log = require("./utils/log");
const { handleError } = require("./utils/utils");
require("dotenv").config();

(async () => {
	const manager = new ClusterManager(`${__dirname}/base/bot.js`, {
		totalShards: "auto",
		shardsPerClusters: 2,
		restarts: {
			max: 5,
			interval: 60000 * 60,
		},
		mode: "process",
		token: `${process.env.client_token}`,
	});

	manager.extend(
		new HeartbeatManager({
			interval: 2000,
			maxMissedHeartbeats: 5,
		})
	);

	manager.on("clusterCreate", (cluster) => {
		Log.info(`Cluster ${cluster.id} created`);
	});
	manager.spawn({ timeout: -1 });
})();

process.on("unhandledRejection", (error) => handleError(error));
process.on("uncaughtException", (error) => handleError(error));
